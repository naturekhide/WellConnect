import { PrismaClient } from "@prisma/client";

var prisma = new PrismaClient();

export async function extractAndSaveHashtags(postId: string, content: string) {
  var hashtagRegex = /#(\w+)/g;
  var matches = content.match(hashtagRegex);
  if (!matches) return;
  for (var i = 0; i < matches.length; i++) {
    var name = matches[i].replace("#", "").toLowerCase();
    var hashtag = await prisma.hashtag.upsert({ where: { name }, update: {}, create: { name } });
    await prisma.postHashtag.upsert({ where: { postId_hashtagId: { postId, hashtagId: hashtag.id } }, update: {}, create: { postId, hashtagId: hashtag.id } });
  }
}