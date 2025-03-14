import '../assets/style.css';
import React from 'react';
import ReactDOM from 'react-dom';

function Popup() {
  return (
    <div>
      <h1>Hello, World!</h1>
      <p>This is the popup content.</p>
    </div>
  );
}

ReactDOM.render(<Popup />, document.getElementById('root'));