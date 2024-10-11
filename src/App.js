import React, { useState, useRef } from 'react';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import { FaCloudUploadAlt, FaSearch } from 'react-icons/fa';

function App() {
  const [emailFile, setEmailFile] = useState(null);
  const [hiddenUrls, setHiddenUrls] = useState([]);
  const [visibleUrls, setVisibleUrls] = useState([]);
  const [classificationResults, setClassificationResults] = useState([]);
  const [emailSafe, setEmailSafe] = useState(null);
  const fileInputRef = useRef(null);

  // Handle file input change (takes both text and files as email content)
  const handleFileChange = (e) => {
    setEmailFile(e.target.files[0]);
  };

  // Extract visible URLs from email content
  const extractVisibleUrls = (text) => {
    const regex = /(?:https?:\/\/|www\.)[^\s]+/g;
    const urls = text.match(regex);
    return urls ? urls : [];
  };

  // Send URLs to Flask backend for classification
  const analyzeUrls = async (urls) => {
    try {
      const response = await fetch('http://127.0.0.1:5000/analyze-urls', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ urls }), // Send URLs in the request body
      });

      const data = await response.json();
      setClassificationResults(data.classification); // Update classification results
    } catch (error) {
      console.error('Error during URL classification:', error);
    }
  };

  // Extract text from email file and classify URLs
  const classifyUrls = async () => {
    if (!emailFile) {
      alert('Please upload an email file.');
      return;
    }

    const emailContent = await emailFile.text(); // Extract text from file
    const visibleUrls = extractVisibleUrls(emailContent); // Extract URLs from text
    setVisibleUrls(visibleUrls);

    // Send visible URLs to the backend for classification
    if (visibleUrls.length > 0) {
      await analyzeUrls(visibleUrls);
    } else {
      console.log("No URLs found for classification.");
    }
  };

  return (
    <div className="container p-4">
      {/* Header */}
      <div className="text-center mb-4">
        <h1 className="display-4">Email Safety Classifier</h1>
        <p className="lead">Upload an email file, and we'll check for unsafe URLs and content.</p>
      </div>

      {/* Card for File Upload */}
      <div className="card shadow-sm mb-4">
        <div className="card-body">
          <div className="row mb-3">
            <div className="col-12 text-center">
              <FaCloudUploadAlt size={60} className="text-primary mb-3" />
              <input
                type="file"
                className="form-control mb-2"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
              <small className="form-text text-muted">
                Drag and drop a file here, paste it, or click to upload.
              </small>
            </div>
          </div>

          {/* Analyze Button */}
          <div className="row">
            <div className="col-12 text-center">
              <button className="btn btn-lg btn-success" onClick={classifyUrls}>
                <FaSearch className="mr-2" />
                Analyze Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* URL Display Section */}
      <div className="row">
        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">Visible URLs</h5>
              <ul className="list-group">
                {visibleUrls.map((url, index) => (
                  <li key={index} className="list-group-item">
                    {url}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="col-md-6 mb-3">
          <div className="card shadow-sm">
            <div className="card-body">
              <h5 className="card-title">URL Classification Results</h5>
              <ul className="list-group">
                {classificationResults.map((result, index) => (
                  <li
                    key={index}
                    className={`list-group-item ${
                      result.status === 'Illegitimate' ? 'list-group-item-danger' : 'list-group-item-success'
                    }`}
                  >
                    {result.url} - {result.status}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
