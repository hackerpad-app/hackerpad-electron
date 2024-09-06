import React, { useState } from "react";

interface Note {
  id: string;
  created_at: string;
  updated_at: string;
  headline: string;
  content: string;
}
interface ChangeModalProps {
  onClose: (headline: string, content: string) => void;
  show: boolean;
  handleClose: () => void;
  displayedNote: Note;
}

const ChangeModal: React.FC<ChangeModalProps> = ({
  show,
  handleClose,
  onClose,
  displayedNote,
}) => {
  const [headline, setHeadline] = useState(displayedNote.headline);
  const [content, setContent] = useState(displayedNote.content);

  const handleSave = () => {
    onClose(headline, content); // Pass back the edited headline and content to App.tsx
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

export default ChangeModal;
