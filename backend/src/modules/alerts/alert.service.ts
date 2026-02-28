import { Alert } from '@prisma/client';
import prisma from '../../shared/prisma';
import { emailService } from '../../shared/email/email.service';
import { emailTemplates } from '../../shared/email/email.templates';

export class AlertService {

    /**
     * Get alerts for a user (unread first, then recent)
     */
    async getAlerts(userId: string, onlyUnread: boolean = false): Promise<Alert[]> {
        const where: any = { userId };
        if (onlyUnread) {
            where.isRead = false;
        }

        return prisma.alert.findMany({
            where,
            orderBy: [
                { isRead: 'asc' },
                { createdAt: 'desc' }
            ],
            take: 50 // Limit to last 50
        });
    }

    /**
     * Get unread count for the bell icon
     */
    async getUnreadCount(userId: string): Promise<number> {
        return prisma.alert.count({
            where: { userId, isRead: false }
        });
    }

    /**
     * Mark an alert as read
     */
    async markAsRead(alertId: string, userId: string): Promise<Alert> {
        // Ensure the alert belongs to the user
        const alert = await prisma.alert.findFirst({
            where: { id: alertId, userId }
        });

        if (!alert) {
            throw new Error('Alert not found or access denied');
        }

        return prisma.alert.update({
            where: { id: alertId },
            data: { isRead: true }
        });
    }

    /**
     * Mark all alerts as read for a user
     */
    async markAllAsRead(userId: string): Promise<void> {
        await prisma.alert.updateMany({
            where: { userId, isRead: false },
            data: { isRead: true }
        });
    }

    /**
     * Create a system alert (internal use)
     */
    async createAlert(data: {
        userId: string;
        companyId: string;
        titleFr: string;
        messageFr: string;
        titleAr?: string;
        messageAr?: string;
        type: string;
        severity: string;
        checkId?: string;
    }): Promise<Alert> {
        const alert = await prisma.alert.create({
            data: {
                userId: data.userId,
                companyId: data.companyId,
                titleFr: data.titleFr,
                messageFr: data.messageFr,
                titleAr: data.titleAr,
                messageAr: data.messageAr,
                type: data.type,
                severity: data.severity,
                checkId: data.checkId,
                isRead: false
            }
        });

        // Fire and forget email notify
        prisma.user.findUnique({
            where: { id: data.userId },
            select: { email: true }
        }).then(user => {
            if (user && user.email) {
                const html = emailTemplates.systemAlert({
                    title: data.titleFr,
                    message: data.messageFr,
                    severity: data.severity,
                    type: data.type,
                    lang: 'fr'
                });
                emailService.sendEmail({
                    to: user.email,
                    subject: `Comply Alerte: ${data.titleFr}`,
                    html
                }).catch(e => console.error('Email send failed', e));
            }
        }).catch(e => console.error('Failed to prepare email alert', e));

        return alert;
    }

    /**
     * Scan deadlines and generate alerts
     * Logic:
     * - 7 days before: Priority MEDIUM, Type DEADLINE_APPROACHING
     * - 1 day before: Priority HIGH, Type DEADLINE_APPROACHING
     * - Overdue: Priority CRITICAL, Type DEADLINE_MISSED
     */
    async scanAndGenerateAlerts(): Promise<{ created: number }> {
        console.log('🔍 Scanning for deadline alerts...');
        let createdCount = 0;

        const users = await prisma.user.findMany({
            where: { isActive: true },
            include: { company: true }
        });

        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        const sevenDaysFromNow = new Date();
        sevenDaysFromNow.setDate(now.getDate() + 7);
        const sevenDaysStr = sevenDaysFromNow.toISOString().split('T')[0];

        const tomorrow = new Date();
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowStr = tomorrow.toISOString().split('T')[0];

        // For each user/company, check deadlines
        for (const user of users) {
            const deadlines = await prisma.deadline.findMany({
                where: {
                    companyId: user.companyId,
                    status: 'PENDING'
                },
                include: {
                    obligation: true
                }
            });

            for (const deadline of deadlines) {
                const dueStr = deadline.dueDate.toISOString().split('T')[0];
                let alertData = null;

                // Case 1: Overdue (Due date is in the past)
                if (dueStr < todayStr) {
                    alertData = {
                        titleFr: 'Échéance dépassée',
                        messageFr: `L'obligation "${deadline.obligation.titleFr}" était due le ${dueStr}.`,
                        type: 'DEADLINE_MISSED',
                        severity: 'CRITICAL'
                    };
                }
                // Case 2: Due Tomorrow
                else if (dueStr === tomorrowStr) {
                    alertData = {
                        titleFr: 'Échéance demain',
                        messageFr: `L'obligation "${deadline.obligation.titleFr}" est due demain.`,
                        type: 'DEADLINE_APPROACHING',
                        severity: 'HIGH'
                    };
                }
                // Case 3: Due in 7 days
                else if (dueStr === sevenDaysStr) {
                    alertData = {
                        titleFr: 'Échéance dans 7 jours',
                        messageFr: `Rappel : "${deadline.obligation.titleFr}" est due le ${dueStr}.`,
                        type: 'DEADLINE_APPROACHING',
                        severity: 'MEDIUM'
                    };
                }

                if (alertData) {
                    const currentAlertData = alertData;
                    // Check if alert already exists for this deadline/type
                    const exists = await prisma.alert.findFirst({
                        where: {
                            userId: user.id,
                            titleFr: currentAlertData.titleFr,
                            type: currentAlertData.type
                        },
                        orderBy: { created: 'desc' }
                    });

                    let shouldCreate = false;

                    if (!exists) {
                        shouldCreate = true;
                    } else if (exists.isRead === false) {
                        const hoursSince = (now.getTime() - exists.created.getTime()) / (1000 * 60 * 60);
                        if (exists.severity === 'CRITICAL' && hoursSince >= 24) shouldCreate = true;
                        else if (exists.severity === 'HIGH' && hoursSince >= 72) shouldCreate = true;
                        else if (exists.severity === 'MEDIUM' && hoursSince >= 168) shouldCreate = true;
                    }

                    if (shouldCreate) {
                        if (exists && exists.isRead === false) {
                            // Update timestamp to reset interval and trigger email
                            await prisma.alert.update({
                                where: { id: exists.id },
                                data: { created: new Date() }
                            });

                            // Send repeated email
                            prisma.user.findUnique({ where: { id: user.id }, select: { email: true } }).then(userData => {
                                if (userData && userData.email) {
                                    const html = emailTemplates.systemAlert({
                                        title: currentAlertData.titleFr,
                                        message: currentAlertData.messageFr,
                                        severity: currentAlertData.severity,
                                        type: currentAlertData.type,
                                        lang: 'fr'
                                    });
                                    emailService.sendEmail({
                                        to: userData.email,
                                        subject: `[Rappel] Comply Alerte: ${currentAlertData.titleFr}`,
                                        html
                                    }).catch(console.error);
                                }
                            }).catch(console.error);
                            createdCount++;
                        } else {
                            await this.createAlert({
                                userId: user.id,
                                companyId: user.companyId,
                                titleFr: currentAlertData.titleFr,
                                messageFr: currentAlertData.messageFr,
                                type: currentAlertData.type,
                                severity: currentAlertData.severity,
                            });
                            createdCount++;
                        }
                    }
                }
            }
        }

        console.log(`✅ Generated ${createdCount} new alerts.`);
        return { created: createdCount };
    }

    /**
     * Delete a specific alert
     */
    async deleteAlert(alertId: string, userId: string): Promise<void> {
        const alert = await prisma.alert.findFirst({
            where: { id: alertId, userId }
        });
        if (!alert) throw new Error('Alert not found');

        await prisma.alert.delete({
            where: { id: alertId }
        });
    }

    /**
     * Delete multiple alerts
     */
    async deleteAlerts(alertIds: string[], userId: string): Promise<void> {
        await prisma.alert.deleteMany({
            where: {
                id: { in: alertIds },
                userId
            }
        });
    }

    /**
     * Mark multiple alerts as read
     */
    async markAlertsAsRead(alertIds: string[], userId: string): Promise<void> {
        await prisma.alert.updateMany({
            where: {
                id: { in: alertIds },
                userId
            },
            data: { isRead: true }
        });
    }
}

export const alertService = new AlertService();
