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
    prisma.product.create({ data: { nombre: "Fideos Matarazzo 500g", precio: 1200, stock: 50, categoryId: almacen.id } }),
    prisma.product.create({ data: { nombre: "Aceite Natura 1.5L", precio: 3800, stock: 30, categoryId: almacen.id } }),
    prisma.product.create({ data: { nombre: "Arroz Gallo Oro 1kg", precio: 1850, stock: 40, categoryId: almacen.id } }),
    prisma.product.create({ data: { nombre: "Yerba Playadito 1kg", precio: 3200, stock: 45, categoryId: almacen.id } }),
    prisma.product.create({ data: { nombre: "Azúcar Ledesma 1kg", precio: 1450, stock: 60, categoryId: almacen.id } }),
    prisma.product.create({ data: { nombre: "Coca-Cola 2.25L", precio: 2500, stock: 80, categoryId: bebidas.id } }),
    prisma.product.create({ data: { nombre: "Cerveza Quilmes 1L", precio: 1800, stock: 100, categoryId: bebidas.id } }),
    prisma.product.create({ data: { nombre: "Agua Villavicencio 2L", precio: 980, stock: 70, categoryId: bebidas.id } }),
    prisma.product.create({ data: { nombre: "Vino Malbec Norton 750ml", precio: 4200, stock: 25, categoryId: bebidas.id } }),
    prisma.product.create({ data: { nombre: "Leche La Serenísima 1L", precio: 1100, stock: 90, categoryId: lacteos.id } }),
    prisma.product.create({ data: { nombre: "Queso Cremoso x kg", precio: 6500, stock: 15, categoryId: lacteos.id } }),
    prisma.product.create({ data: { nombre: "Yogur Yogurísimo 1kg", precio: 2100, stock: 35, categoryId: lacteos.id } }),
    prisma.product.create({ data: { nombre: "Manteca La Paulina 200g", precio: 1600, stock: 40, categoryId: lacteos.id } }),
    prisma.product.create({ data: { nombre: "Detergente Magistral 750ml", precio: 1750, stock: 50, categoryId: limpieza.id } }),
    prisma.product.create({ data: { nombre: "Lavandina Ayudín 2L", precio: 1300, stock: 40, categoryId: limpieza.id } }),
    prisma.product.create({ data: { nombre: "Papel Higiénico x4", precio: 2400, stock: 60, categoryId: limpieza.id } }),
    prisma.product.create({ data: { nombre: "Jabón en polvo Skip 800g", precio: 3200, stock: 30, categoryId: limpieza.id } }),
    prisma.product.create({ data: { nombre: "Banana x kg", precio: 1500, stock: 100, categoryId: fruver.id } }),
    prisma.product.create({ data: { nombre: "Manzana Roja x kg", precio: 2200, stock: 80, categoryId: fruver.id } }),
    prisma.product.create({ data: { nombre: "Tomate Perita x kg", precio: 1800, stock: 60, categoryId: fruver.id } }),
    prisma.product.create({ data: { nombre: "Lechuga Mantecosa", precio: 900, stock: 40, categoryId: fruver.id } }),
    prisma.product.create({ data: { nombre: "Papa x kg", precio: 1200, stock: 80, categoryId: fruver.id } }),
    prisma.product.create({ data: { nombre: "Pan Francés x kg", precio: 2800, stock: 30, categoryId: panaderia.id } }),
    prisma.product.create({ data: { nombre: "Facturas x docena", precio: 3500, stock: 20, categoryId: panaderia.id } }),
    prisma.product.create({ data: { nombre: "Medialunas x 6", precio: 2200, stock: 25, categoryId: panaderia.id } }),
    prisma.product.create({ data: { nombre: "Asado x kg", precio: 8900, stock: 25, categoryId: carniceria.id } }),
    prisma.product.create({ data: { nombre: "Pollo entero x kg", precio: 4200, stock: 30, categoryId: carniceria.id } }),
    prisma.product.create({ data: { nombre: "Milanesas de pollo x kg", precio: 5800, stock: 20, categoryId: carniceria.id } }),
    prisma.product.create({ data: { nombre: "Chorizo x kg", precio: 4500, stock: 30, categoryId: carniceria.id } }),
    prisma.product.create({ data: { nombre: "Pava eléctrica Atma", precio: 45000, stock: 8, categoryId: electro.id } }),
    prisma.product.create({ data: { nombre: "Licuadora Philips", precio: 78000, stock: 5, categoryId: electro.id } }),
    prisma.product.create({ data: { nombre: "Tostadora Liliana", precio: 35000, stock: 10, categoryId: electro.id } }),
  ]);

  const enUnMes = new Date();
  enUnMes.setMonth(enUnMes.getMonth() + 1);

  await prisma.offer.createMany({
    data: [
      { productId: productos[0].id, porcentaje: 20, fechaFin: enUnMes, esImperdible: true, activa: true },
      { productId: productos[5].id, porcentaje: 15, fechaFin: enUnMes, esImperdible: true, activa: true },
      { productId: productos[6].id, porcentaje: 25, fechaFin: enUnMes, esImperdible: true, activa: true },
      { productId: productos[17].id, porcentaje: 30, fechaFin: enUnMes, esImperdible: true, activa: true },
      { productId: productos[25].id, porcentaje: 12, fechaFin: enUnMes, esImperdible: false, activa: true },
      { productId: productos[29].id, porcentaje: 10, fechaFin: enUnMes, esImperdible: false, activa: true },
    ],
  });

  console.log("\n✅ Seed completado");
  console.log("\nCuentas de prueba:");
  console.log("  Admin:     admin@changuito.com     / admin123");
  console.log("  Repositor: repositor@changuito.com / repo123");
  console.log("  Clientes:  registrate desde la web\n");
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
