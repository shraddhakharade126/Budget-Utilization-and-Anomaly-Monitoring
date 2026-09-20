import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { UserModel, IUser, UserRole } from '../models/index.js';

export interface AuthRequest extends Request {
  user?: IUser;
}

export function getJwtSecret(): string {
  return process.env.JWT_SECRET || 'govbudget_jwt_secret_secure_key_auth_2026';
}

export function signToken(user: IUser): string {
  return jwt.sign(
    {
      userId: user._id,
      id: user._id,
      email: user.email,
      role: user.role,
      departmentId: user.departmentId || null,
      name: user.name
    },
    getJwtSecret(),
    { expiresIn: '12h' }
  );
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, message: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  if (!token || token.trim() === '') {
    res.status(401).json({ success: false, message: 'Authentication required. Bearer token is empty.' });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret()) as {
      userId?: string;
      id?: string;
      email: string;
      role: UserRole;
      departmentId?: string | null;
    };

    const targetId = decoded.userId || decoded.id;
    if (!targetId) {
      res.status(401).json({ success: false, message: 'Invalid token payload: missing userId.' });
      return;
    }

    const user = await UserModel.findById(targetId);

    if (!user || !user.isActive) {
      res.status(401).json({ success: false, message: 'Account is inactive or does not exist.' });
      return;
    }

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token.' });
  }
}

export function authorize(...roles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized. Please login.' });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: `Forbidden: Role '${req.user.role}' lacks required permissions for this action. Allowed: [${roles.join(', ')}]`
      });
      return;
    }

    next();
  };
}

export function departmentAccessGuard(req: AuthRequest, res: Response, next: NextFunction): void {
  if (!req.user) {
    res.status(401).json({ success: false, message: 'Unauthorized' });
    return;
  }

  // Admin has global access to all departments
  if (req.user.role === 'ADMIN') {
    next();
    return;
  }

  // FINANCE_OFFICER & DEPARTMENT_HEAD can only access their assigned department
  const targetDept = req.params.departmentId || req.body.departmentId || (req.query.departmentId as string);

  if (targetDept && req.user.departmentId && targetDept !== req.user.departmentId) {
    res.status(403).json({
      success: false,
      message: 'Access Denied: You can only view or manage records for your assigned department.'
    });
    return;
  }

  next();
}
