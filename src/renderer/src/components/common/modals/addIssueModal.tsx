import React, { useState } from "react";

interface AddModalProps {
  onClose: (headline: string, content: string) => void; // Updated to pass back data
  show: boolean;
  handleClose: () => void;
}

const AddModal: React.FC<AddModalProps> = ({ show, handleClose, onClose }) => {
  const [headline, setHeadline] = useState("");
  const [content, setContent] = useState("");

  const handleSave = () => {
    onClose(headline, content); // Pass back the headline and content to App.tsx
    handleClose();
  };

  return (
    <div
      className={`${
        show ? "flex" : "hidden"
      } fixed inset-0 bg-black bg-opacity-50 z-50 justify-center items-center`}
    >
      <section className="bg-red-300 p-5 rounded-lg shadow-lg z-50">
        <input
          type="text"
          placeholder="Headline"
          value={headline}
          onChange={(e) => setHeadline(e.target.value)}
          className="mb-4 p-2 border rounded"
        />

        <input
          placeholder="Content"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="mb-4 p-2 border rounded"
        />
        <button
          type="button"
          onClick={handleSave}
          className="mt-4 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Save and Close
        </button>
      </section>
    </div>
  );
};

export default AddModal;
