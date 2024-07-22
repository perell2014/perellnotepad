// Data structure to store sections and notes
let sections = [];

// DOM elements
const tabBar = document.getElementById('tabBar');
const notesContainer = document.getElementById('notesContainer');
const createSectionBtn = document.getElementById('createSection');
const createNoteBtn = document.getElementById('createNote');
//const darkModeToggleBtn = document.getElementById('darkModeToggle');
const confirmationModal = document.getElementById('confirmationModal');
const confirmationMessage = document.getElementById('confirmationMessage');
const confirmYesBtn = document.getElementById('confirmYes');
const confirmNoBtn = document.getElementById('confirmNo');

const collapseAllBtn = document.getElementById('collapseAll');
const saveAllNotesBtn = document.getElementById('saveAllNotes');

// Event listeners
createSectionBtn.addEventListener('click', createSection);
createNoteBtn.addEventListener('click', createNote);
//darkModeToggleBtn.addEventListener('click', toggleDarkMode);
confirmYesBtn.addEventListener('click', handleConfirmation);
confirmNoBtn.addEventListener('click', closeConfirmationModal);
collapseAllBtn.addEventListener('click', toggleAllNotes);
saveAllNotesBtn.addEventListener('click', saveAllNotesAsText);

// Load data from local storage
loadData();


function createSection() {
    const sectionName = prompt('Enter section name:');
    if (sectionName) {
        const section = {
            id: Date.now(),
            name: sectionName,
            notes: []
        };
        sections.push(section);
        renderTabs();
        saveData();
    }
}

function createNote() {
    const activeSection = document.querySelector('.tab.active');
    if (activeSection) {
        const sectionId = parseInt(activeSection.dataset.sectionId);
        const noteName = prompt('Enter note name:');
        if (noteName) {
            const note = {
                id: Date.now(),
                name: noteName,
                content: ''
            };
            const section = sections.find(s => s.id === sectionId);
            section.notes.push(note);
            renderNotes(sectionId);
            saveData();
        }
    } else {
        alert('Please select a section first.');
    }
}

function renderTabs() {
    tabBar.innerHTML = '';
    var first = true;
    sections.forEach(section => {
        const tab = document.createElement('div');
        tab.className = 'tab bg-gray-200 dark:bg-gray-600 px-4 py-2 rounded-t-lg cursor-pointer';    
        tab.dataset.sectionId = section.id;
        tab.innerHTML = `
            <span class="section-name">${section.name}</span>
            <i class="fas fa-times ml-2 text-red-500" onclick="deleteSection(${section.id})"></i>
        `;
        tab.addEventListener('click', () => selectSection(section.id));
        tab.addEventListener('dblclick', (e) => {
            if (e.target.classList.contains('section-name')) {
                editSectionName(section.id);
            }
        });
        tabBar.appendChild(tab);
    });
    if (sections.length > 0) {
        selectSection(sections[0].id);
    }
    //NEW 
    initializeDragAndDrop();
}

function renderNotes(sectionId) {
    const section = sections.find(s => s.id === sectionId);
    notesContainer.innerHTML = '';
    section.notes.forEach(note => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note bg-white dark:bg-gray-700 p-4 mb-4 rounded-lg shadow';
        noteElement.dataset.noteId = note.id;
        noteElement.innerHTML = `
            <div class="note-header flex justify-between items-center cursor-pointer mb-2">
                <h3 class="note-name text-lg font-semibold">${note.name}</h3>
                <div class="note-actions">
                    <i class="fas fa-file-code mr-2 cursor-pointer" title="Download note html" onclick="downloadNote(${note.id}, 'html')"></i>
                    <i class="fas fa-download mr-2 cursor-pointer" title="Download note txt" onclick="downloadNote(${note.id}, 'txt')"></i>
                    <i class="fas fa-copy mr-2 cursor-pointer" title="Duplicate note" onclick="duplicateNote(${note.id})"></i>
                    <i class="fas fa-trash text-red-500 cursor-pointer" title="Delete note" onclick="deleteNote(${note.id})"></i>
                    <i class="fas fa-chevron-down ml-2 cursor-pointer toggle-note" title="Toggle note" onclick="toggleNote(this,${note.id})"></i>
                </div>
            </div>
            <div class="note-content" id="note-${note.id}">${note.content}</div>
        `;
        notesContainer.appendChild(noteElement);
        noteElement.querySelector('.note-name').addEventListener('dblclick', () => editNoteName(note.id));
    });
    initializeTinyMCE();
    initializeDragAndDrop();
}

function selectSection(sectionId) {
     //Switch to dark mode
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle.checked) {
        body.classList.toggle('dark-mode');
        modeToggle.checked = false;
    }
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => tab.classList.remove('active', 'bg-blue-200', 'dark:bg-blue-700'));
    const activeTab = document.querySelector(`.tab[data-section-id="${sectionId}"]`);
    activeTab.classList.add('active', 'bg-blue-200', 'dark:bg-blue-700');
    renderNotes(sectionId);
}

function editSectionName(sectionId) {
    console.log("kljklsadjklsadjklsadjklsad");
    //Switch to dark mode
    const modeToggle = document.getElementById('mode-toggle');
    if (modeToggle.checked) {
        body.classList.toggle('dark-mode');
        modeToggle.checked = false;
    }
    const section = sections.find(s => s.id === sectionId);
    const newName = prompt('Enter new section name:', section.name);
    if (newName && newName !== section.name) {
        section.name = newName;
        renderTabs();
        saveData();
    }
}

function editNoteName(noteId) {
    const section = sections.find(s => s.notes.some(n => n.id === noteId));
    const note = section.notes.find(n => n.id === noteId);
    const newName = prompt('Enter new note name:', note.name);
    if (newName && newName !== note.name) {
        note.name = newName;
        renderNotes(section.id);
        saveData();
    }
}

function deleteSection(sectionId) {
    showConfirmationModal('Are you sure you want to delete this section?', () => {
        sections = sections.filter(s => s.id !== sectionId);
        renderTabs();
        saveData();
    });
}

function deleteNote(noteId) {
    showConfirmationModal('Are you sure you want to delete this note?', () => {
        const section = sections.find(s => s.notes.some(n => n.id === noteId));
        section.notes = section.notes.filter(n => n.id !== noteId);
        renderNotes(section.id);
        saveData();
    });
}

function duplicateNote(noteId) {
    const section = sections.find(s => s.notes.some(n => n.id === noteId));
    const note = section.notes.find(n => n.id === noteId);
    const newNote = {
        id: Date.now(),
        name: `${note.name} (Copy)`,
        content: note.content
    };
    section.notes.push(newNote);
    renderNotes(section.id);
    saveData();
}

function downloadNote(noteId, format) {
    const section = sections.find(s => s.notes.some(n => n.id === noteId));
    const note = section.notes.find(n => n.id === noteId);
    const content = format === 'html' ? note.content : stripHtml(note.content);
    const blob = new Blob([content], { type: format === 'html' ? 'text/html' : 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${note.name}.${format}`;
    a.click();
}

function stripHtml(html) {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
}

function saveNote(noteId) {
    const section = sections.find(s => s.notes.some(n => n.id === parseInt(noteId)));
    const note = section.notes.find(n => n.id === parseInt(noteId));
    note.content = tinymce.get(`note-${noteId}`).getContent();
    saveData();
}

function saveData() {
    localStorage.setItem('perellNotepadData', JSON.stringify(sections));
}

function loadData() {
    const data = localStorage.getItem('perellNotepadData');
    if (data) {
        sections = JSON.parse(data);
        renderTabs();
    }
}

function initializeTinyMCE() {
    tinymce.remove();
    tinymce.init({
        selector: '.note-content',
    plugins: 'preview searchreplace autolink directionality visualblocks visualchars image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap emoticons autosave fullscreen searchreplace advlist',
    toolbar: 'undo redo print spellcheckdialog formatpainter | blocks fontfamily fontsize | bold italic underline forecolor backcolor | link image | alignleft aligncenter alignright alignjustify lineheight | checklist bullist numlist indent outdent | removeformat',
    height: '300px',
    /*skin: window.matchMedia("(prefers-color-scheme: dark)").matches ? "oxide-dark": "oxide", 
           content_css: window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "default",*/
    skin: "oxide-dark",
    content_css: "dark",
    setup: function(editor) {
        editor.on('blur', function(e) {
            saveNote(e.target.id.split('-')[1]);
        });
    }
    });
}

function reinitializeTinyMCELight() {
    tinymce.remove();
    tinymce.init({
        selector: '.note-content',
    plugins: 'preview searchreplace autolink directionality visualblocks visualchars image link media codesample table charmap pagebreak nonbreaking anchor insertdatetime advlist lists wordcount help charmap emoticons autosave fullscreen searchreplace advlist',
    toolbar: 'undo redo print spellcheckdialog formatpainter | blocks fontfamily fontsize | bold italic underline forecolor backcolor | link image | alignleft aligncenter alignright alignjustify lineheight | checklist bullist numlist indent outdent | removeformat',
    height: '300px',
    setup: function(editor) {
        editor.on('blur', function(e) {
            saveNote(e.target.id.split('-')[1]);
        });
    }

    /*OLD*/
        /*selector: '.note-content',
        plugins: 'link image lists',
        toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image',
        height: 300,
        setup: function(editor) {
            editor.on('blur', function(e) {
                saveNote(e.target.id.split('-')[1]);
            });
        }*/
    });
}

function showConfirmationModal(message, onConfirm) {
    confirmationMessage.textContent = message;
    confirmationModal.style.display = 'flex';
    confirmYesBtn.onclick = () => {
        onConfirm();
        closeConfirmationModal();
    };
}

function closeConfirmationModal() {
    confirmationModal.style.display = 'none';
}

function handleConfirmation() {
    // This function is intentionally left empty as the actual confirmation
    // logic is handled in the showConfirmationModal function
}

function toggleNote(icon, noteId) {
    const noteElement = icon.closest('.note');
    const content = noteElement.querySelector('.note-content');
    //const editor = tinymce.get(`note-${noteElement.dataset.noteId}`);
    const editor = tinymce.get(`note-${noteId}`);

    if(icon.classList.contains('fa-chevron-down')) {
         //tinymce.activeEditor.hide();
         editor.hide();
         content.style.display = 'none';
    } else {
         editor.show();
         //tinymce.activeEditor.show()
    }

    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}


/************************************DARK MODE TOGGLE *******************************************/

const body = document.body;
const modeToggle = document.getElementById('mode-toggle');
//const modeText = document.getElementById('mode-text');
modeToggle.addEventListener('change', () => {
    body.classList.toggle('dark-mode');
    if (body.classList.contains('dark-mode')) {
        reinitializeTinyMCELight();
        //modeText.textContent = 'Dark Mode';
    } else {
        initializeTinyMCE();
        //modeText.textContent = 'Light Mode';
    }
});

/************************************END DARK MODE TOGGLE *******************************************/

/***************************** DRAG DROP  **********************************************************/
// Initialize drag and drop for notes
    /* new Sortable(document.getElementById('notesContainer'), {
            animation: 150,
            onEnd: function(evt) {
                const noteId = parseInt(evt.item.dataset.id);
                const note = currentSection.notes.find(n => n.id === noteId);
                currentSection.notes.splice(evt.oldIndex, 1);
                currentSection.notes.splice(evt.newIndex, 0, note);
            }
        });

        // Initialize drag and drop for sections
       new Sortable(document.getElementById('tabBar'), {
            animation: 150,
            direction: 'horizontal',
            onEnd: function(evt) {
                const sectionId = parseInt(evt.item.dataset.id);
                const section = sections.find(s => s.id === sectionId);
                sections.splice(evt.oldIndex, 1);
                sections.splice(evt.newIndex, 0, section);
            }
        });
*/
/*************************************************************************************************/

/***drag drop 2*************************************************************************************/
// Add new functions for drag and drop
function initializeDragAndDrop() {

    new Sortable(notesContainer, {
        animation: 150,
        onEnd: function(evt) {
            const activeTabElement = document.querySelector('.tab.active');
            if (!activeTabElement) {
                console.error('No active tab found');
                return;
            }
            const activeSectionId = parseInt(activeTabElement.dataset.sectionId);
            const activeSection = sections.find(s => s.id === activeSectionId);
            if (!activeSection) {
                console.error('Active section not found');
                return;
            }
            const noteElement = evt.item;
            const noteId = parseInt(noteElement.dataset.noteId);
            const noteIndex = activeSection.notes.findIndex(n => n.id === noteId);
            if (noteIndex === -1) {
                console.error('Note not found in active section');
                return;
            }
            const note = activeSection.notes[noteIndex];
            
            activeSection.notes.splice(noteIndex, 1);
            activeSection.notes.splice(evt.newIndex, 0, note);
            
            renderNotes(activeSectionId);
            saveData();
        }
    });

    // The rest of the function remains the same
    new Sortable(tabBar, {
        animation: 150,
        direction: 'horizontal',
        onEnd: function(evt) {
            const sectionId = parseInt(evt.item.dataset.sectionId);
            const sectionIndex = sections.findIndex(s => s.id === sectionId);
            const section = sections[sectionIndex];
            
            sections.splice(sectionIndex, 1);
            sections.splice(evt.newIndex, 0, section);
            
            saveData();
        }
    });

    new Sortable(tabBar, {
        animation: 150,
        direction: 'horizontal',
        onEnd: function(evt) {
            const sectionId = parseInt(evt.item.dataset.sectionId);
            const sectionIndex = sections.findIndex(s => s.id === sectionId);
            const section = sections[sectionIndex];
            
            sections.splice(sectionIndex, 1);
            sections.splice(evt.newIndex, 0, section);
            
            saveData();
        }
    });
}

// Add function to toggle all notes
function toggleAllNotes() {
    const noteIcons = document.querySelectorAll('.toggle-note');
    const isCollapsed = noteIcons[0].classList.contains('fa-chevron-down');
    
    noteIcons.forEach(icon => {
        const noteElement = icon.closest('.note');
        const content = noteElement.querySelector('.note-content');
        const noteId = noteElement.dataset.noteId;
        const editor = tinymce.get(`note-${noteId}`);
        
        if (isCollapsed) {
            editor.hide();
            content.style.display = 'none';
            //content.style.display = 'block';
            //icon.classList.remove('fa-chevron-down');
            //icon.classList.add('fa-chevron-up');
        } else {
            editor.show();
            //content.style.display = 'none';
            //icon.classList.remove('fa-chevron-up');
            //icon.classList.add('fa-chevron-down');
        }
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });
}

/*function toggleNote(icon, noteId) {
    const noteElement = icon.closest('.note');
    const content = noteElement.querySelector('.note-content');
    //const editor = tinymce.get(`note-${noteElement.dataset.noteId}`);
    const editor = tinymce.get(`note-${noteId}`);

    if(icon.classList.contains('fa-chevron-down')) {
         //tinymce.activeEditor.hide();
         editor.hide();
         content.style.display = 'none';
    } else {
         editor.show();
         //tinymce.activeEditor.show()
    }

    icon.classList.toggle('fa-chevron-down');
    icon.classList.toggle('fa-chevron-up');
}*/

// Add function to save all notes as text
function saveAllNotesAsText() {
    const activeSection = sections.find(s => s.id === parseInt(document.querySelector('.tab.active').dataset.sectionId));
    let allNotesContent = `Section: ${activeSection.name}\n\n`;
    
    activeSection.notes.forEach(note => {
        allNotesContent += `Note: ${note.name}\n`;
        allNotesContent += `${stripHtml(note.content)}\n\n`;
    });
    
    const blob = new Blob([allNotesContent], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${activeSection.name}_notes.txt`;
    a.click();
}

/*************************************************************************************************/

// Initialize the app
renderTabs();
initializeDragAndDrop();