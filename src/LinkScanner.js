import Tesseract from 'tesseract.js';
import * as pdfjsLib from 'pdfjs-dist/build/pdf';
import { LinkifyIt } from 'linkify-it';

const linkify = new LinkifyIt();

// Function to extract URLs from plain text
const extractUrlsFromText = (text) => {
  const urls = linkify.match(text);
  return urls ? urls.map(link => link.url) : [];
};

// Function to extract text from image using Tesseract.js
const extractTextFromImage = (imageFile) => {
  return Tesseract.recognize(
    imageFile,
    'eng',
    {
      logger: info => console.log(info) // Log progress
    }
  ).then(({ data: { text } }) => {
    return extractUrlsFromText(text);
  });
};

// Function to extract text from PDF file using PDF.js
const extractTextFromPDF = async (pdfFile) => {
  const pdf = await pdfjsLib.getDocument(pdfFile).promise;
  const numPages = pdf.numPages;
  let textContent = '';

  for (let pageNum = 1; pageNum <= numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const text = await page.getTextContent();
    const pageText = text.items.map(item => item.str).join(' ');
    textContent += pageText + ' ';
  }

  return extractUrlsFromText(textContent);
};

// Function to process files
const processFiles = async (files) => {
  const allUrls = [];

  for (const file of files) {
    if (file.type.startsWith('image/')) {
      // Process images
      const urlsFromImage = await extractTextFromImage(file);
      allUrls.push(...urlsFromImage);
    } else if (file.type === 'application/pdf') {
      // Process PDF
      const urlsFromPDF = await extractTextFromPDF(file);
      allUrls.push(...urlsFromPDF);
    } else if (file.type.startsWith('text/')) {
      // Process plain text files
      const text = await file.text();
      const urlsFromText = extractUrlsFromText(text);
      allUrls.push(...urlsFromText);
    } else if (file.type.startsWith('video/')) {
      // If video, you may want to extract subtitles or any text
      console.log(`Text extraction from video not implemented: ${file.name}`);
    } else {
      console.log(`Unsupported file type: ${file.type}`);
    }
  }

  return allUrls;
};

// Example usage
document.getElementById('file-input').addEventListener('change', async (event) => {
  const files = event.target.files;
  const urls = await processFiles(files);
  console.log('Extracted URLs:', urls);
});
