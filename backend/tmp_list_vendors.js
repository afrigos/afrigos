(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const vendors = await prisma.user.findMany({
      where: { role: 'VENDOR' },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        isActive: true,
        isVerified: true,
        vendorProfile: { select: { id: true, businessName: true, verificationStatus: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    console.log(JSON.stringify(vendors, null, 2));
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
