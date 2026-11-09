const fs = require('fs');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// PASTE YOUR TEXT INSIDE THE BACKTICKS BELOW
const rawText = `
PASTE_YOUR_HINDI_TEXT_HERE
`;

async function main() {
  console.log("Parsing text...");
  
  // Split by "Song number." (e.g., "1.", "27.", "120.")
  const songBlocks = rawText.split(/\n(?=\d+[\.\s])/);
  
  let currentLang = "Hindi";
  let importedCount = 0;

  for (let block of songBlocks) {
    // Check if we hit the Bengali section (you can adjust this keyword)
    if (block.includes("সূচীপত্র") || block.includes("আবাহন")) {
      currentLang = "Bengali";
    }

    const lines = block.trim().split('\n');
    if (lines.length < 2) continue;

    // Extract number and title from the first line
    const firstLine = lines[0].trim();
    const match = firstLine.match(/^(\d+)[\.\s]+(.*)/);
    
    if (match) {
      const number = parseInt(match[1]);
      const title = match[2].trim();
      const lyrics = lines.slice(1).join('\n').trim();

      // Ignore page numbers or empty blocks
      if (title.length > 2 && lyrics.length > 5) {
        await prisma.song.create({
          data: {
            number: number,
            title: title,
            lyrics: lyrics,
            language: currentLang,
          }
        });
        importedCount++;
      }
    }
  }

  console.log(`\n✅ Successfully imported ${importedCount} songs into the database!`);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());