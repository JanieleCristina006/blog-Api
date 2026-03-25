import { prisma } from "../../database/db.js";

class ListUsersService {
  async execute() {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        photo_profile: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users;
  }
}

export default ListUsersService;
