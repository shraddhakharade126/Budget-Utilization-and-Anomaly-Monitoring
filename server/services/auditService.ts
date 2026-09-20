import { AuditLogModel, IAuditLog } from '../models/index.js';

export interface AuditParams {
  userId: string;
  userName: string;
  userRole?: string;
  action: string;
  entity: string;
  entityId: string;
  oldValue?: any;
  newValue?: any;
  ipAddress?: string;
}

export async function logAuditEvent(params: AuditParams): Promise<IAuditLog> {
  // Sanitize values to prevent logging password hashes or sensitive tokens
  const cleanOld = sanitizeAuditData(params.oldValue);
  const cleanNew = sanitizeAuditData(params.newValue);

  const entry = await AuditLogModel.create({
    userId: params.userId,
    userName: params.userName,
    userRole: params.userRole || 'SYSTEM',
    action: params.action,
    entity: params.entity,
    entityId: params.entityId,
    oldValue: cleanOld,
    newValue: cleanNew,
    timestamp: new Date().toISOString(),
    ipAddress: params.ipAddress || '127.0.0.1'
  });

  return entry;
}

function sanitizeAuditData(data: any): any {
  if (!data || typeof data !== 'object') return data;
  const clone = { ...data };
  if ('password' in clone) delete clone.password;
  if ('passwordHash' in clone) delete clone.passwordHash;
  if ('token' in clone) delete clone.token;
  return clone;
}
