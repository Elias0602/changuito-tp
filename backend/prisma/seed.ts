import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando base de datos...");

  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.subscription.deleteMany();
  await prisma.adminProfile.deleteMany();
  await prisma.restockerProfile.deleteMany();
  await prisma.user.deleteMany();

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  await prisma.user.create({
    data: {
      nombre: "Admin",
      email: "admin@changuito.com",
      password: hash("admin123"),
      role: "ADMIN",
      adminProfile: {
        create: {
          nivelSeguridad: "ALTO",
          puedeDescuentos: true,
          puedeMantenimiento: true,
          puedePrecios: true,
          puedeStock: true,
        },
      },
    },
  });

  await prisma.user.create({
    data: {
      nombre: "Repositor",
      email: "repositor@changuito.com",
      password: hash("repo123"),
      role: "RESTOCKER",
      restockerProfile: { create: { zona: "DEPOSITO" } },
    },
  });

  const cats = await Promise.all([
    prisma.category.create({ data: { nombre: "Almacén", slug: "almacen", icono: "🥫" } }),
    prisma.category.create({ data: { nombre: "Bebidas", slug: "bebidas", icono: "🥤" } }),
    prisma.category.create({ data: { nombre: "Lácteos", slug: "lacteos", icono: "🥛" } }),
    prisma.category.create({ data: { nombre: "Limpieza", slug: "limpieza", icono: "🧽" } }),
    prisma.category.create({ data: { nombre: "Frutas y Verduras", slug: "frutas-verduras", icono: "🥕" } }),
    prisma.category.create({ data: { nombre: "Panadería", slug: "panaderia", icono: "🥖" } }),
    prisma.category.create({ data: { nombre: "Carnicería", slug: "carniceria", icono: "🥩" } }),
    prisma.category.create({ data: { nombre: "Electro", slug: "electro", icono: "🔌" } }),
  ]);

  const [almacen, bebidas, lacteos, limpieza, fruver, panaderia, carniceria, electro] = cats;

  const productos = await Promise.all([
    prisma.product.create({ data: { nombre: "Fideos Matarazzo 500g", precio: 1200, stock: 50, categoryId: almacen.id, imagenUrl: "https://images.unsplash.com/photo-1551462147-37885acc36f1?w=400" } }),
    prisma.product.create({ data: { nombre: "Aceite Natura 1.5L", precio: 3800, stock: 30, categoryId: almacen.id, imagenUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400" } }),
    prisma.product.create({ data: { nombre: "Arroz Gallo Oro 1kg", precio: 1850, stock: 40, categoryId: almacen.id, imagenUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400" } }),
    prisma.product.create({ data: { nombre: "Yerba Playadito 1kg", precio: 3200, stock: 45, categoryId: almacen.id, imagenUrl: "https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400" } }),
    prisma.product.create({ data: { nombre: "Coca-Cola 2.25L", precio: 2500, stock: 80, categoryId: bebidas.id, imagenUrl: "https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400" } }),
    prisma.product.create({ data: { nombre: "Cerveza Quilmes 1L", precio: 1800, stock: 100, categoryId: bebidas.id, imagenUrl: "https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400" } }),
    prisma.product.create({ data: { nombre: "Agua Villavicencio 2L", precio: 980, stock: 70, categoryId: bebidas.id, imagenUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400" } }),
    prisma.product.create({ data: { nombre: "Leche La Serenísima 1L", precio: 1100, stock: 90, categoryId: lacteos.id, imagenUrl: "https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400" } }),
    prisma.product.create({ data: { nombre: "Queso Cremoso x kg", precio: 6500, stock: 15, categoryId: lacteos.id, imagenUrl: "https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400" } }),
    prisma.product.create({ data: { nombre: "Yogur Yogurísimo 1kg", precio: 2100, stock: 35, categoryId: lacteos.id, imagenUrl: "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400" } }),
    prisma.product.create({ data: { nombre: "Detergente Magistral 750ml", precio: 1750, stock: 50, categoryId: limpieza.id, imagenUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400" } }),
    prisma.product.create({ data: { nombre: "Lavandina Ayudín 2L", precio: 1300, stock: 40, categoryId: limpieza.id, imagenUrl: "https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400" } }),
    prisma.product.create({ data: { nombre: "Papel Higiénico x4", precio: 2400, stock: 60, categoryId: limpieza.id, imagenUrl: "https://images.unsplash.com/photo-1584556812952-905ffd0c611a?w=400" } }),
    prisma.product.create({ data: { nombre: "Banana x kg", precio: 1500, stock: 100, categoryId: fruver.id, imagenUrl: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400" } }),
    prisma.product.create({ data: { nombre: "Manzana Roja x kg", precio: 2200, stock: 80, categoryId: fruver.id, imagenUrl: "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400" } }),
    prisma.product.create({ data: { nombre: "Tomate Perita x kg", precio: 1800, stock: 60, categoryId: fruver.id, imagenUrl: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400" } }),
    prisma.product.create({ data: { nombre: "Pan Francés x kg", precio: 2800, stock: 30, categoryId: panaderia.id, imagenUrl: "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400" } }),
    prisma.product.create({ data: { nombre: "Facturas x docena", precio: 3500, stock: 20, categoryId: panaderia.id, imagenUrl: "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400" } }),
    prisma.product.create({ data: { nombre: "Asado x kg", precio: 8900, stock: 25, categoryId: carniceria.id, imagenUrl: "https://images.unsplash.com/photo-1558030006-450675393462?w=400" } }),
    prisma.product.create({ data: { nombre: "Pollo entero x kg", precio: 4200, stock: 30, categoryId: carniceria.id, imagenUrl: "https://images.unsplash.com/photo-1604503468506-a8da13d82791?w=400" } }),
    prisma.product.create({ data: { nombre: "Pava eléctrica Atma", precio: 45000, stock: 8, categoryId: electro.id, imagenUrl: "https://images.unsplash.com/photo-1593853963555-013dadedfaf5?w=400" } }),
    prisma.product.create({ data: { nombre: "Licuadora Philips", precio: 78000, stock: 5, categoryId: electro.id, imagenUrl: "https://images.unsplash.com/photo-1622480916113-9000ac49b79d?w=400" } }),
  ]);

  const enUnMes = new Date();
  enUnMes.setMonth(enUnMes.getMonth() + 1);

  await prisma.offer.createMany({
    data: [
      { productId: productos[0].id, porcentaje: 20, fechaFin: enUnMes, esImperdible: true, activa: true },
      { productId: productos[4].id, porcentaje: 15, fechaFin: enUnMes, esImperdible: true, activa: true },
      { productId: productos[5].id, porcentaje: 25, fechaFin: enUnMes, esImperdible: true, activa: true },
      { productId: productos[13].id, porcentaje: 30, fechaFin: enUnMes, esImperdible: true, activa: true },
      { productId: productos[20].id, porcentaje: 10, fechaFin: enUnMes, esImperdible: false, activa: true },
    ],
  });

  console.log("✅ Seed listo!");
  console.log("admin@changuito.com / admin123");
  console.log("repositor@changuito.com / repo123");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
