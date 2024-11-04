const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
  const notesList = document.getElementById('notes-list');
  const noteContent = document.getElementById('note-content');
  const saveBtn = document.getElementById('save-btn');
  const deleteBtn = document.getElementById('delete-btn');
  const searchBar = document.getElementById('search-bar');
  const exportPDFBtn = document.getElementById('export-pdf-btn');
  const exportTxtBtn = document.getElementById('export-txt-btn');

  let notes = [];
  let filteredNotes = []; // This will hold the notes filtered by the search query
  let selectedNoteId = null;

  // Load notes when app starts
  ipcRenderer.invoke('load-notes').then((loadedNotes) => {
    notes = loadedNotes;
    filteredNotes = notes; // Initially, all notes are displayed
    renderNotesList();
  });



  // Save button event handler
  saveBtn.addEventListener('click', () => {
    const content = noteContent.value.trim();
    if (!content) return;

    if (selectedNoteId === null) {
      // New note
      const note = { id: Date.now(), content };
      ipcRenderer.invoke('save-note', note).then(() => {
        notes.push(note);
        filteredNotes = notes; // Refresh filtered notes
        renderNotesList();
        noteContent.value = '';
      });
    } else {
      // Update existing note
      const updatedNote = { id: selectedNoteId, content };
      ipcRenderer.invoke('update-note', updatedNote).then(() => {
        const noteIndex = notes.findIndex(note => note.id === selectedNoteId);
        if (noteIndex !== -1) notes[noteIndex] = updatedNote;
        filteredNotes = notes;
        renderNotesList();
      });
    }
  });

  // Delete button event handler
  deleteBtn.addEventListener('click', () => {
    console.log('Deleting note...');
    if (selectedNoteId === null) return;

    ipcRenderer.invoke('delete-note', selectedNoteId).then(() => {
      notes = notes.filter(note => note.id !== selectedNoteId);
      filteredNotes = notes;
      renderNotesList();
      noteContent.value = '';
      selectedNoteId = null;
    });
  });

  // Search bar event handler
  searchBar.addEventListener('input', (event) => {
    const query = event.target.value.toLowerCase();
    filteredNotes = notes.filter(note => note.content.toLowerCase().includes(query));
    renderNotesList();
  });


exportPDFBtn.addEventListener('click', () => {
    console.log('Exporting note as PDF...');
    if (selectedNoteId === null) {
        console.error('No note selected');
        return;
    }

    const note = notes.find(note => note.id === selectedNoteId);
    if (!note) {
        console.error('Note not found');
        return;
    }

    const doc = new PDFDocument();
    const filePath = path.join(__dirname, `note-${note.id}.pdf`);

    doc.pipe(fs.createWriteStream(filePath));
    doc.text(note.content);
    doc.end();

    alert(`Note exported as PDF to ${filePath}`);
    console.log(`PDF exported to ${filePath}`);
});

exportTxtBtn.addEventListener('click', () => {
    console.log('Exporting note as TXT...');
    if (selectedNoteId === null) {
        console.error('No note selected');
        return;
    }

    const note = notes.find(note => note.id === selectedNoteId);
    if (!note) {
        console.error('Note not found');
        return;
    }

    const filePath = path.join(__dirname, `note-${note.id}.txt`);
    fs.writeFileSync(filePath, note.content);

    alert(`Note exported as TXT to ${filePath}`);
    console.log(`TXT exported to ${filePath}`);
});

  // Render the list of notes
  function renderNotesList() {
    notesList.innerHTML = '';
    filteredNotes.forEach((note) => {
      const noteItem = document.createElement('li');
      noteItem.textContent = note.content.slice(0, 20) + '...';
      noteItem.addEventListener('click', () => {
        selectedNoteId = note.id;
        noteContent.value = note.content;
      });
      notesList.appendChild(noteItem);
    });
  }


});
