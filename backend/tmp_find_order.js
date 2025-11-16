(async () => {
  try {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    const orderNumber = 'AFG-1763308953387-8YD325IBE';
    const order = await prisma.order.findFirst({
      where: { orderNumber },
      include: { vendor: { include: { user: { select: { email: true } } } } }
    });
    if (!order) {
      console.log(JSON.stringify({ found: false }, null, 2));
    } else {
      console.log(JSON.stringify({ found: true, orderId: order.id, vendorId: order.vendorId, store: order.vendor?.businessName, vendorEmail: order.vendor?.user?.email }, null, 2));
    }
    await prisma.$disconnect();
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
})();
