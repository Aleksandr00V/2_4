const fs = require('fs').promises;
const path = require('path');
const readline = require('readline');
const { EventEmitter } = require('events');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const fileManagerEmitter = new EventEmitter();
const workingDir = process.cwd();

function showMenu() {
  console.log(`
Виберіть дію:
1 - Створити файл
2 - Створити каталог
3 - Читати файл
4 - Читати вміст каталогу
5 - Оновити файл (додати текст)
6 - Перейменувати файл/каталог
7 - Видалити файл
8 - Видалити каталог
9 - Вийти
  `);
}

function promptUser() {
  showMenu();
  rl.question('Введіть номер дії: ', (action) => {
    fileManagerEmitter.emit('actionSelected', action);
  });
}

fileManagerEmitter.on('actionSelected', async (action) => {
  try {
    switch (action) {
      case '1':
        rl.question('Введіть назву файлу: ', async (fileName) => {
          const filePath = path.join(workingDir, fileName);
          await fs.writeFile(filePath, '');
          fileManagerEmitter.emit('fileCreated', fileName);
          promptUser();
        });
        break;

      case '2':
        rl.question('Введіть назву каталогу: ', async (dirName) => {
          const dirPath = path.join(workingDir, dirName);
          await fs.mkdir(dirPath);
          fileManagerEmitter.emit('directoryCreated', dirName);
          promptUser();
        });
        break;

      case '3':
        rl.question('Введіть назву файлу для читання: ', async (fileName) => {
          const filePath = path.join(workingDir, fileName);
          const content = await fs.readFile(filePath, 'utf8');
          fileManagerEmitter.emit('fileRead', fileName, content);
          promptUser();
        });
        break;

      case '4':
        rl.question('Введіть назву каталогу для читання: ', async (dirName) => {
          const dirPath = path.join(workingDir, dirName);
          const files = await fs.readdir(dirPath);
          fileManagerEmitter.emit('directoryRead', dirName, files);
          promptUser();
        });
        break;

      case '5':
        rl.question('Введіть назву файлу для оновлення: ', async (fileName) => {
          rl.question('Введіть текст для додавання: ', async (text) => {
            const filePath = path.join(workingDir, fileName);
            await fs.appendFile(filePath, text + '\n');
            fileManagerEmitter.emit('fileUpdated', fileName);
            promptUser();
          });
        });
        break;

      case '6':
        rl.question('Введіть поточну назву файлу/каталогу: ', async (oldName) => {
          rl.question('Введіть нову назву: ', async (newName) => {
            const oldPath = path.join(workingDir, oldName);
            const newPath = path.join(workingDir, newName);
            await fs.rename(oldPath, newPath);
            fileManagerEmitter.emit('renamed', oldName, newName);
            promptUser();
          });
        });
        break;

      case '7':
        rl.question('Введіть назву файлу для видалення: ', async (fileName) => {
          const filePath = path.join(workingDir, fileName);
          await fs.unlink(filePath);
          fileManagerEmitter.emit('fileDeleted', fileName);
          promptUser();
        });
        break;

      case '8':
        rl.question('Введіть назву каталогу для видалення: ', async (dirName) => {
          const dirPath = path.join(workingDir, dirName);
          await fs.rm(dirPath, { recursive: true });
          fileManagerEmitter.emit('directoryDeleted', dirName);
          promptUser();
        });
        break;

      case '9':
        fileManagerEmitter.emit('exit');
        break;

      default:
        console.log('Невірна дія. Спробуйте ще раз.');
        promptUser();
    }
  } catch (err) {
    fileManagerEmitter.emit('error', err.message);
    promptUser();
  }
});

fileManagerEmitter.on('fileCreated', (fileName) => {
  console.log(`Подія: Файл "${fileName}" створено успішно!`);
});

fileManagerEmitter.on('directoryCreated', (dirName) => {
  console.log(`Подія: Каталог "${dirName}" створено успішно!`);
});

fileManagerEmitter.on('fileRead', (fileName, content) => {
  console.log(`Подія: Вміст файлу "${fileName}":\n${content}`);
});

fileManagerEmitter.on('directoryRead', (dirName, files) => {
  console.log(`Подія: Вміст каталогу "${dirName}":\n${files.join('\n')}`);
});

fileManagerEmitter.on('fileUpdated', (fileName) => {
  console.log(`Подія: Файл "${fileName}" оновлено успішно!`);
});

fileManagerEmitter.on('renamed', (oldName, newName) => {
  console.log(`Подія: "${oldName}" перейменовано на "${newName}" успішно!`);
});

fileManagerEmitter.on('fileDeleted', (fileName) => {
  console.log(`Подія: Файл "${fileName}" видалено успішно!`);
});

fileManagerEmitter.on('directoryDeleted', (dirName) => {
  console.log(`Подія: Каталог "${dirName}" видалено успішно!`);
});

fileManagerEmitter.on('error', (message) => {
  console.log(`Помилка: ${message}`);
});

fileManagerEmitter.on('exit', () => {
  console.log('Програма завершена.');
  rl.close();
});

promptUser();