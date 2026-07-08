import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { TECH_TOPIC_CATALOG } from "../src/lib/config/topicCatalog";

const adapter = new PrismaPg(process.env.DATABASE_URL as string);
const prisma = new PrismaClient({ adapter });

async function main() {
  for (const [category, topics] of Object.entries(TECH_TOPIC_CATALOG)) {
    for (const topic of topics) {
      await prisma.techTopicCatalog.upsert({
        where: { topic },
        update: { category },
        create: { topic, category },
      });
    }
  }
  console.log("Seeded TechTopicCatalog");
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
