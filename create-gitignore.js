import fs from 'fs/promises';

const gitignoreContent = `
node_modules/
.next/
.env.local
`;

async function createGitignore() {
  try {
    await fs.writeFile('.gitignore', gitignoreContent.trim());
    console.log('.gitignore file created successfully.');
  } catch (error) {
    console.error('Error creating .gitignore file:', error);
  }
}

createGitignore();