import { PrismaClient, Audit, AuditType } from '@prisma/client';

const prisma = new PrismaClient();

export class AuditService {

    /**
     * List audits with RBAC filtering
     * - Admin/Compliance Officer: See ALL
     * - Employee: See ONLY if LeadAuditor OR in AuditTeam
     */
    async listAudits(user: { id: string, role: string, companyId: string }, filters?: any) {
        const where: any = {
            companyId: user.companyId
        };

        // RBAC: If not Admin/Officer, restrict to assigned audits
        if (user.role !== 'COMPANY_ADMIN' && user.role !== 'COMPLIANCE_OFFICER') {
            where.OR = [
                { leadAuditorId: user.id },
                { auditTeam: { some: { id: user.id } } }
            ];
        }

        // Apply filters
        if (filters?.status) where.status = filters.status;
        if (filters?.typeId) where.auditTypeId = filters.typeId;
        if (filters?.scope) where.auditType = { scope: filters.scope };

        return prisma.audit.findMany({
            where,
            include: {
                auditType: true,
                leadAuditor: {
                    select: { id: true, firstName: true, lastName: true }
                },
                auditTeam: {
                    select: { id: true, firstName: true, lastName: true }
                },
                _count: {
                    select: { correctiveActions: true }
                }
            },
            orderBy: { scheduledDate: 'asc' }
        });
    }

    async listAuditTypes() {
        return prisma.auditType.findMany({
            where: { isActive: true },
            orderBy: { name: 'asc' }
        });
    }

    async getAuditById(id: string, user: { userId?: string, id?: string, role: string, companyId: string }) {
        const userId = user.userId || user.id;
        const audit = await prisma.audit.findUnique({
            where: { id },
            include: {
                auditType: true,
                leadAuditor: true,
                auditTeam: true,
                correctiveActions: {
                    include: { assignee: true }
                },
                checks: {
                    include: { control: true }
                }
            }
        });

        if (!audit || audit.companyId !== user.companyId) {
            throw new Error('Audit not found');
        }

        // RBAC Check for View Detail
        if (user.role !== 'COMPANY_ADMIN' && user.role !== 'COMPLIANCE_OFFICER') {
            const isLead = audit.leadAuditorId === userId;
            const isTeam = audit.auditTeam.some(m => m.id === userId);
            if (!isLead && !isTeam) {
                throw new Error('Unauthorized access to this audit');
            }
        }

        return audit;
    }

    async startAudit(id: string, userId: string, role: string, companyId: string) {
        // 1. Get Audit (also verifies permissions)
        const audit = await this.getAuditById(id, { userId, role, companyId });

        // 2. Check if already started
        if (audit.status === 'IN_PROGRESS' || audit.status === 'COMPLETED') {
            return audit;
        }

        // 3. Find Controls to checklist
        const controls = await prisma.control.findMany({
            where: {
                isActive: true,
                obligation: {
                    category: audit.auditType.category
                }
            }
        });

        // 4. Create Checks (if not already existing?)
        // Better to check if checks exist to avoid duplicates if restarted
        const existingChecks = await prisma.check.count({ where: { auditId: id } });
        if (existingChecks === 0 && controls.length > 0) {
            await prisma.check.createMany({
                data: controls.map(c => ({
                    auditId: id,
                    controlId: c.id,
                    companyId: audit.companyId,
                    status: 'PENDING',
                    performedBy: userId,
                    checkDate: new Date()
                }))
            });
        }

        // 5. Update Status
        return prisma.audit.update({
            where: { id },
            data: {
                status: 'IN_PROGRESS',
                performedDate: new Date()
            },
            include: {
                checks: { include: { control: true } }
            }
        });
    }

    async completeAudit(id: string, userId: string, role: string, companyId: string) {
        // 1. Get Audit (also verifies permissions)
        const audit = await this.getAuditById(id, { userId, role, companyId });

        if (audit.status === 'COMPLETED') {
            return audit;
        }

        // 2. Fetch checks to calculate score
        const checks = await prisma.check.findMany({ where: { auditId: id } });

        let score = 0;
        if (checks.length > 0) {
            const passCount = checks.filter(c => c.status === 'COMPLIANT' || c.status === 'PASS').length;
            score = (passCount / checks.length) * 100;
        }

        // 3. Complete audit
        return prisma.audit.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                score: Math.round(score),
                performedDate: audit.performedDate || new Date()
            },
            include: {
                checks: { include: { control: true } }
            }
        });
    }

    async createAudit(data: {
        companyId: string,
        auditTypeId: string,
        scheduledDate: string | Date,
        auditorName?: string,
        leadAuditorId?: string,
        auditTeamIds?: string[]
    }) {
        // Calculate next due date logic could go here based on frequency

        return prisma.audit.create({
            data: {
                companyId: data.companyId,
                auditTypeId: data.auditTypeId,
                scheduledDate: new Date(data.scheduledDate),
                auditorName: data.auditorName,
                leadAuditorId: data.leadAuditorId,
                auditTeam: data.auditTeamIds ? {
                    connect: data.auditTeamIds.map(id => ({ id }))
                } : undefined
            }
        });
    }

    async updateAudit(id: string, data: any, user: { userId?: string, id?: string, role: string, companyId: string }) {
        // First check permissions
        await this.getAuditById(id, user); // Re-use get check

        // If completing, maybe calculate score or logic?

        return prisma.audit.update({
            where: { id },
            data: {
                ...data,
                scheduledDate: data.scheduledDate ? new Date(data.scheduledDate) : undefined,
                performedDate: data.performedDate ? new Date(data.performedDate) : undefined,
                auditTeam: data.auditTeamIds ? {
                    set: data.auditTeamIds.map((id: string) => ({ id }))
                } : undefined
            }
        });
    }

    async deleteAudit(id: string, user: { userId?: string, id?: string, role: string, companyId: string }) {
        // First check permissions and existence
        const audit = await this.getAuditById(id, user); // Inherits RBAC checks

        // Actually delete the audit
        // Prisma's onDelete: Cascade will handle deleting associated check/corrective action records if configured in schema.
        // Otherwise, need manual deletion. Assuming Cascade for now.
        return prisma.audit.delete({
            where: { id }
        });
    }

    async addCorrectiveAction(auditId: string, data: any) {
        return prisma.correctiveAction.create({
            data: {
                auditId,
                description: data.description,
                severity: data.severity,
                assignedTo: data.assignedTo,
                dueDate: data.dueDate ? new Date(data.dueDate) : undefined
            }
        });
    }
}

export const auditService = new AuditService();
