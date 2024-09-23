# MangaExtension

**Extension to bookmark mangas you like.**

## Index

1. [Installation](#installation)
2. [Loading the Extension in Chrome](#loading-the-extension-in-chrome)
3. [Direct Download from Chrome Web Store](#direct-download-from-chrome-web-store)
4. [Development](#development)
5. [TODO](#todo)

## Installation

1. Clone this repository:
```git
git clone https://github.com/Kosmosama/MangaExtension.git
```
3. Navigate to the project directory:
```bash
cd MangaExtension
```
3. Install the necessary dependencies:
   If you plan to work on the extension, you'll need to install the required Node.js dependencies (including Tailwind CSS). To do so, run:
```node
npm install
```
## Loading the Extension in Chrome

1. Open Chrome and navigate to chrome://extensions/.
2. Enable **Developer Mode** (toggle located in the top right corner).
3. Click on **Load unpacked**.
4. Select the project folder `MangaExtension` that you cloned earlier.

The extension should now be loaded in Chrome, and you can start using it to bookmark your favorite mangas!

## Direct Download from Chrome Web Store

You can also download and install the extension directly from the Chrome Web Store by following this link:

[MangaExtension on Chrome Web Store](https://chromewebstore.google.com/detail/manga-library/agdepjcnhljkjcnnmanbooinhoaieidc)


## Development

If you plan to make changes to the extension, ensure that you run the following commands to build the project:

- To build the Tailwind CSS styles, run:
  ```
  npx tailwindcss -i ./public/input.css -o ./public/tailwind-styles.css --watch
  ```


## TODO

For future improvements and pending tasks, check the [TODO.md](./TODO.md) file.
