"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.jortService = exports.JortService = void 0;
var prisma_1 = require("../../shared/prisma");
var JortService = /** @class */ (function () {
    function JortService() {
    }
    JortService.prototype.createEntry = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, prisma_1.default.jortEntry.create({
                        data: __assign(__assign({}, data), { date: data.date ? new Date(data.date) : null })
                    })];
            });
        });
    };
    JortService.prototype.listEntries = function (query) {
        return __awaiter(this, void 0, void 0, function () {
            var page, limit, status, ministry, search, skip, where, _a, entries, total;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        page = query.page, limit = query.limit, status = query.status, ministry = query.ministry, search = query.search;
                        skip = (page - 1) * limit;
                        where = {};
                        if (status)
                            where.status = status;
                        if (ministry)
                            where.ministry = { contains: ministry, mode: 'insensitive' };
                        if (search) {
                            where.OR = [
                                { titleFr: { contains: search, mode: 'insensitive' } },
                                { titleAr: { contains: search, mode: 'insensitive' } },
                                { ministry: { contains: search, mode: 'insensitive' } },
                                { type: { contains: search, mode: 'insensitive' } },
                            ];
                        }
                        return [4 /*yield*/, Promise.all([
                                prisma_1.default.jortEntry.findMany({
                                    where: where,
                                    skip: skip,
                                    take: limit,
                                    orderBy: { date: 'desc' },
                                }),
                                prisma_1.default.jortEntry.count({ where: where }),
                            ])];
                    case 1:
                        _a = _b.sent(), entries = _a[0], total = _a[1];
                        return [2 /*return*/, {
                                entries: entries,
                                total: total,
                                page: page,
                                limit: limit,
                                totalPages: Math.ceil(total / limit),
                            }];
                }
            });
        });
    };
    JortService.prototype.updateStatus = function (id, status) {
        return __awaiter(this, void 0, void 0, function () {
            var entry, assessImpact, impact, impactMsgFr, companies, emailService, emailTemplates, _i, companies_1, company, emailHtml, recipients;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, prisma_1.default.jortEntry.update({
                            where: { id: id },
                            data: {
                                status: status,
                                processed: true
                            }
                        })];
                    case 1:
                        entry = _a.sent();
                        if (!(status === 'RELEVANT')) return [3 /*break*/, 6];
                        assessImpact = require('./jort.impact').assessImpact;
                        impact = assessImpact(entry.titleFr, entry.titleAr, entry.ministry);
                        impactMsgFr = '';
                        if (impact.categories.length > 0) {
                            impactMsgFr = "\n\nDomaines impact\u00E9s : ".concat(impact.categories.join(', '));
                        }
                        return [4 /*yield*/, prisma_1.default.company.findMany({
                                include: {
                                    users: {
                                        where: {
                                            role: { in: ['COMPANY_ADMIN', 'COMPLIANCE_OFFICER'] },
                                            isActive: true
                                        }
                                    }
                                }
                            })];
                    case 2:
                        companies = _a.sent();
                        emailService = require('../../shared/email/email.service').emailService;
                        emailTemplates = require('../../shared/email/email.templates').emailTemplates;
                        _i = 0, companies_1 = companies;
                        _a.label = 3;
                    case 3:
                        if (!(_i < companies_1.length)) return [3 /*break*/, 6];
                        company = companies_1[_i];
                        // 1. Create In-App Alert
                        return [4 /*yield*/, prisma_1.default.alert.create({
                                data: {
                                    companyId: company.id,
                                    type: 'REGULATORY_UPDATE',
                                    severity: impact.score > 70 ? 'CRITICAL' : 'HIGH',
                                    titleFr: "Veille JORT : ".concat(entry.type || 'Nouveau texte', " - ").concat(impact.categories[0] || 'Général'),
                                    titleAr: entry.titleAr ? "\u0645\u062A\u0627\u0628\u0639\u0629 \u0627\u0644\u0631\u0627\u0626\u062F \u0627\u0644\u0631\u0633\u0645\u064A : ".concat(entry.type || 'نص جديد') : null,
                                    messageFr: "Une nouvelle publication pertinente a \u00E9t\u00E9 identifi\u00E9e : \"".concat(entry.titleFr, "\".").concat(impactMsgFr, "\nMerci de v\u00E9rifier son impact sur vos activit\u00E9s."),
                                    messageAr: entry.titleAr ? "\u062A\u0645 \u062A\u062D\u062F\u064A\u062F \u0645\u0646\u0634\u0648\u0631 \u062C\u062F\u064A\u062F \u0630\u0648 \u0635\u0644\u0629 : \"".concat(entry.titleAr, "\". \u064A\u0631\u062C\u0649 \u0627\u0644\u062A\u062D\u0642\u0642 \u0645\u0646 \u062A\u0623\u062B\u064A\u0631\u0647 \u0639\u0644\u0649 \u0623\u0646\u0634\u0637\u062A\u0643\u0645.") : null,
                                }
                            })];
                    case 4:
                        // 1. Create In-App Alert
                        _a.sent();
                        // 2. Send Email if High/Critical Impact (Score > 50)
                        if (impact.score > 50 && company.users.length > 0) {
                            emailHtml = emailTemplates.newRegulationAlert(entry, impact);
                            recipients = company.users.map(function (u) { return u.email; });
                            // Send in background, don't await blocking
                            emailService.sendEmail({
                                to: recipients,
                                subject: "[JORT] Nouvelle R\u00E9glementation : ".concat(entry.titleFr.substring(0, 50), "..."),
                                html: emailHtml
                            }).catch(function (err) { return console.error('Failed to send JORT email:', err); });
                        }
                        _a.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, entry];
                }
            });
        });
    };
    return JortService;
}());
exports.JortService = JortService;
exports.jortService = new JortService();
