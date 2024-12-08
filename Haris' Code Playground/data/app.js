// Initialize Ace Editor
let editor = ace.edit("editor");
editor.setTheme("ace/theme/monokai");
editor.session.setMode("ace/mode/html"); // Default to HTML mode

// Initialize Blockly
let workspace = Blockly.inject('blocklyDiv', {
  toolbox: `
    <xml>
      <category name="Logic" colour="%{BKY_LOGIC_HUE}">
        <block type="controls_if"></block>
        <block type="logic_compare"></block>
        <block type="logic_operation"></block>
        <block type="logic_negate"></block>
        <block type="logic_boolean"></block>
      </category>
      <category name="Loops" colour="%{BKY_LOOPS_HUE}">
        <block type="controls_repeat_ext"></block>
        <block type="controls_whileUntil"></block>
      </category>
      <category name="Math" colour="%{BKY_MATH_HUE}">
        <block type="math_number"></block>
        <block type="math_arithmetic"></block>
      </category>
      <category name="Text" colour="%{BKY_TEXTS_HUE}">
        <block type="text"></block>
        <block type="text_join"></block>
      </category>
    </xml>
  `,
});

// Supported languages and Ace modes
const languages = {
  html: "html",
  css: "css",
  javascript: "javascript",
  python: "python",
  java: "java",
};

// Switch between languages in text editor
function switchLanguage(language) {
  document.getElementById('textEditor').style.display = 'block';
  document.getElementById('visualEditor').style.display = 'none';
  document.getElementById('outputFrame').style.display = 'none';  // Hide output iframe

  const aceMode = languages[language] || "html";
  editor.session.setMode(`ace/mode/${aceMode}`);
  editor.setValue("");  // Clear editor for new code
}

// Switch between text and visual editors
function showEditor(type) {
  if (type === 'text') {
    document.getElementById('textEditor').style.display = 'block';
    document.getElementById('visualEditor').style.display = 'none';
  } else {
    document.getElementById('textEditor').style.display = 'none';
    document.getElementById('visualEditor').style.display = 'block';
  }
}

// Run Code Functionality
function runCode() {
  let code;
  const mode = editor.session.getMode().$id;

  if (document.getElementById('textEditor').style.display === 'block') {
    code = editor.getValue();
    
    if (mode === "ace/mode/javascript") {
      try {
        eval(code);  // Run JavaScript code
      } catch (e) {
        alert('JavaScript Error: ' + e.message);
      }
    } else if (mode === "ace/mode/python") {
      const script = document.createElement('script');
      script.type = 'text/python';
      script.text = code;
      document.body.appendChild(script);
    } else if (mode === "ace/mode/java") {
      cheerpjRunJava(code);  // CheerpJ: Run Java code
    } else if (mode === "ace/mode/html" || mode === "ace/mode/css") {
      runHTMLCSS(code);  // Render HTML/CSS in iframe
    } else {
      alert('Execution not supported for this language.');
    }
  } else {
    code = Blockly.JavaScript.workspaceToCode(workspace);
    try {
      eval(code);
    } catch (e) {
      alert('Error: ' + e.message);
    }
  }
}

// Run HTML/CSS code by rendering in iframe
function runHTMLCSS(code) {
  const iframe = document.getElementById('outputFrame');
  iframe.style.display = 'block';
  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(code);
  doc.close();
}

// Run Java code using CheerpJ
function cheerpjRunJava(javaCode) {
  const blob = new Blob([javaCode], { type: 'application/java-archive' });
  const reader = new FileReader();

  reader.onload = function (e) {
    cheerpjInit();  // Initialize CheerpJ
    cheerpjRunBlob(reader.result, "MainClass");  // Execute Java bytecode
  };
  
  reader.readAsDataURL(blob);
}

// Save Code Functionality
function saveCode() {
  const code = document.getElementById('textEditor').style.display === 'block' ? 
    editor.getValue() : 
    Blockly.JavaScript.workspaceToCode(workspace);
  
  const blob = new Blob([code], { type: 'text/plain' });
  const link = document.createElement('a');
  link.download = 'code.txt';
  link.href = window.URL.createObjectURL(blob);
  link.click();
}

// Load Code Functionality
function loadCode() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'text/plain';
  
  input.onchange = e => {
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = readerEvent => {
      const content = readerEvent.target.result;
      if (document.getElementById('textEditor').style.display === 'block') {
        editor.setValue(content);
      } else {
        alert('Blockly code loading is not implemented yet.');
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}
