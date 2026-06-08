import prisma from '../db';

type Role = 'admin' | 'viewer';

const unreadWhereForRole = (role: Role) => (
  role === 'admin' ? { readByAdmin: false } : { readByViewer: false }
);

const readDataForRole = (role: Role) => (
  role === 'admin' ? { readByAdmin: true } : { readByViewer: true }
);

export const listNotices = async (options: { unreadOnly?: boolean; role: Role }) => {
  return prisma.notice.findMany({
    where: {
      isActive: true,
      ...(options.unreadOnly ? unreadWhereForRole(options.role) : {}),
    },
    orderBy: { createdAt: 'desc' },
  });
};

export const createNotice = async (data: { title: string; body: string; authorRole?: string }) => {
  return prisma.notice.create({
    data: {
      title: data.title.trim(),
      body: data.body.trim(),
      authorRole: data.authorRole,
    },
  });
};

export const markNoticeRead = async (id: string, role: Role) => {
  return prisma.notice.update({
    where: { id },
    data: readDataForRole(role),
  });
};

export const deleteNotice = async (id: string) => {
  return prisma.notice.update({
    where: { id },
    data: { isActive: false },
  });
};
