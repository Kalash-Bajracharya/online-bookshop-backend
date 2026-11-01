
import User from "../model/User.js";
import bcrypt from "bcrypt";

export const seedAdmin = async () => {
  try {
    const adminEmail = "admin@example.com";
    const adminPassword = "Admin@123";

    const existingAdmin = await User.findOne({
      email: adminEmail,
    });

    if (existingAdmin) {
      console.log("Admin already exists");
      return;
    }

    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    const admin = await User.create({
      name: "Admin",
      email: adminEmail,
      password: hashedPassword,
      role: "ADMIN",
    });

    console.log("Admin created successfully:", admin.email);
  } catch (error) {
    console.error("Error seeding admin:", error);
    throw error;
  }
};
