import useNotes from "../hooks/useNotes";
import Sidebar from "./common/Sidebar";
import Editor from "./common/Editor";

interface IssuesProps {
  pad: string;
  setPad: React.Dispatch<React.SetStateAction<string | null>>;
}

export default function Issues({ pad, setPad }: IssuesProps) {
  const {
    createNote,
    removeNote,
    updateNote,
    setSearchQuery,
    searchResults,
    allNotesIssues,
    displayedNoteIssues,
    setDisplayedNoteIssues,
  } = useNotes(pad);

  return (
    <div className="flex flex-row">
      <div className="flex w-1/5 h-full overflow-hidden">
        <Sidebar
          pad={pad}
          setPad={setPad}
          updateNote={updateNote}
          searchResults={searchResults}
          allNotes={allNotesIssues}
          setDisplayedNote={setDisplayedNoteIssues}
          displayedNote={displayedNoteIssues}
        />
      </div>
      <div className="w-4/5 h-full overflow-y-auto bg-dark-green">
        <Editor
          pad={pad}
          createNote={createNote}
          removeNote={removeNote}
          updateNote={updateNote}
          setSearchQuery={setSearchQuery}
          displayedNote={displayedNoteIssues}
          setDisplayedNote={setDisplayedNoteIssues}
        />
      </div>
    </div>
  );
}
