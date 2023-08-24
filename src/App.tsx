import { Component } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Icon from '@mdi/react';
import { mdiRefresh, mdiPencil } from '@mdi/js';
import Edit from "./Edit";

type Note = {
  id: number, 
  value: string, 
  tags: Set<string>,
}

type AppState = {
  notes: Set<Note>,
  selected_notes: Set<Note>,
  all_tags: Array<string>,
  yes_tags: Set<string>,
  no_tags: Set<string>,
  db_path: string,
  active_tab: string,
  open_forms_ids: Set<number>,
}

interface AppProps {
}

class App extends Component<AppProps, AppState> {
  constructor (props: AppProps){
    super(props);

    this.state = {
      notes: new Set([]),
      selected_notes: new Set([]),
      all_tags: [],
      yes_tags: new Set([]),
      no_tags: new Set([]),
      db_path: "",
      active_tab: "notes",
      open_forms_ids: new Set([]),
    };

    this.updateNotesAndTags = this.updateNotesAndTags.bind(this);
    this.handleTagClick = this.handleTagClick.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleHide = this.handleHide.bind(this);
    this.setDirPath = this.setDirPath.bind(this);
    this.updateSelectedNotes = this.updateSelectedNotes.bind(this);
  }

  componentDidMount() {
    this.updateNotesAndTags();
    this.setDirPath();
  }

  setDirPath() {
    invoke("db_path").then((result) => {
      this.setState({db_path: result as string});
    });
  }

  updateNotesAndTags() {
    invoke<Set<Note>>("notes").then((data) => {
      let all_tags_set: Set<string> = new Set([]);
      [...data]
        .forEach((n) => all_tags_set = new Set([...all_tags_set, ...n.tags]));
      let all_tags = [...all_tags_set].sort();  
      let notes: Set<Note> = new Set([...data].map((n) => {
        let tmp: Note = {id: n.id, value: n.value, tags: new Set(n.tags)};
        return tmp;
      }));
      this.setState({notes, all_tags}, () => {
        this.updateSelectedNotes();
      });
    });
  }

  updateSelectedNotes() {
    let selected_notes;
    if (this.state.yes_tags.size == 0 && this.state.no_tags.size == 0) {
      selected_notes = this.state.notes;
    } else {
      selected_notes = new Set([...this.state.notes].filter((note) => {
        let included_tags_found = false;
        for (let t of this.state.yes_tags) {
          if (note.tags.has(t)) {
            included_tags_found = true;
            break;
          }
        };
        let excluded_tags_found = false;
        if (included_tags_found || this.state.yes_tags.size == 0) {
          for (let t of this.state.no_tags) {
            if (note.tags.has(t)) {
              excluded_tags_found = true;
              break;
            }
          };
        }
        return (included_tags_found || this.state.yes_tags.size == 0) && !excluded_tags_found;
      }));
    }
    this.setState({selected_notes});
  }

  handleRefreshClick = (_e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    this.setState({
      yes_tags: new Set([]),
      no_tags: new Set([]),
    }, () => {
      this.updateSelectedNotes();
    });
  }

  handleTagClick = (e: React.MouseEvent<HTMLSpanElement, MouseEvent>, t: string) => {
    let primary_tags;
    let other_tags;
    if (e.type === 'click') {
      primary_tags = this.state.yes_tags;
      other_tags = this.state.no_tags;
    } else if (e.type === 'contextmenu') {
      primary_tags = this.state.no_tags;
      other_tags = this.state.yes_tags;
    } else {
      throw Error("Unknown behavior");
    }
    if (primary_tags.has(t)) {
      primary_tags.delete(t);
    } else {
      if (other_tags.has(t)) {
        other_tags.delete(t);
      }
      primary_tags.add(t);
    }

    let state_change;
    if (e.type === 'click') {
      state_change = {
        yes_tags: primary_tags,
        no_tags: other_tags,
      }
    } else {
      state_change = {
        no_tags: primary_tags,
        yes_tags: other_tags,
      }
    }

    this.setState(state_change, () => {
      this.updateSelectedNotes();
    });
    e.preventDefault();
  }

  handleTabClick = (_: React.MouseEvent<HTMLLIElement, MouseEvent>, id: string) => {
    this.setState({
      active_tab: id,
    });
  }

  handleEditClick = (_: React.MouseEvent<HTMLSpanElement, MouseEvent>, id: number) => {
    let open_forms_ids = this.state.open_forms_ids;
    open_forms_ids.add(id);
    this.setState({open_forms_ids});
  }

  handleSubmit = (id: null | number, note: string, tags: string): Promise<string> => {
    let result;
    if (id) {
      result = invoke("update", {id: id, note: note, tags: tags})
        .then((result) => {
          this.handleHide(id);
          this.updateNotesAndTags();
          return result as string;
        })
        .catch((error) => {
          throw new Error(error);
        });
    } else {
      result = invoke("insert", {note: note, tags: tags})
        .then((result) => {
          this.updateNotesAndTags();
          return result as string;
        })
        .catch((error) => {
          throw new Error(error);
        });
    }
    return result;
  }

  handleDelete = (id: number): Promise<string> => {
    return invoke("delete", {id: id}).then((result) => {
      if ((result as string).length == 0) {
        this.updateNotesAndTags();
      }
      return result as string;
    });
  }

  handleHide = (id: number) => {
    let open_forms_ids = this.state.open_forms_ids;
    open_forms_ids.delete(id);
    this.setState({open_forms_ids});
  }

  render() {
      const newProps = {
        id: null,
        text: "",
        tags: "",
        handleSubmit: this.handleSubmit,
        handleDelete: this.handleDelete,
        handleHide: this.handleHide,
      }
      return (
        <div className="block">
          <div className="tabs is-centered is-large m-4">
            <ul>
              <li id="notes-tab" className={this.state.active_tab == "notes" ? "is-active" : ""} onClick={(e) => this.handleTabClick(e, "notes")}><a>Notes</a></li>
              <li id="new-tab" className={this.state.active_tab == "new" ? "is-active" : ""} onClick={(e) => this.handleTabClick(e, "new")}><a>New</a></li>
              <li id="about-tab" className={this.state.active_tab == "about" ? "is-active" : ""} onClick={(e) => this.handleTabClick(e, "about")}><a>About</a></li>
            </ul>
          </div>

          <div id="notes" className={"container p-4 " + (this.state.active_tab == "notes" ? "" : "is-hidden")}>
            <div className="container has-text-centered">
              {this.state.all_tags.length > 0 && <div className="tags is-centered">
                {this.state.all_tags.map((t) =>
                  <span className={"tag is-light is-medium is-clickable" +
                    (this.state.yes_tags.has(t) ? " is-primary" : (this.state.no_tags.has(t) ? " is-warning" : ""))}
                    onClick={(e) => {this.handleTagClick(e, t)}}
                    onContextMenu={(e) => {this.handleTagClick(e, t)}}
                    key={t as React.Key}>
                    {t}
                  </span>
                )}
                <span title="Clear" key = "__refresh" className="m-1 is-clickable" onClick={this.handleRefreshClick} >
                  <Icon path={mdiRefresh} size={1} />
                </span>
              </div>}
              {this.state.all_tags.length == 0  &&
              <div className="container">
                No tags yet
              </div>}
            </div>

            <div className="container has-text-centered">
              {this.state.selected_notes.size == 0  &&
              <div className="container mt-4">
                No notes selected
              </div>}
              <div className="block has-text-left m-6">
                {[...this.state.selected_notes].map((d) =>
                  <div key={d.id.toString() as React.Key} className="block">
                    <div className="block mb-4">
                      {d.value}
                      <span id={"edit_" + d.id.toString()} className="ml-2 is-clickable" onClick={(e) => {this.handleEditClick(e, d.id)}} >
                        <Icon path={mdiPencil} size={0.7} />
                      </span>
                    </div>
                    {d.tags.size > 0 && <div className="tags">
                      {[...d.tags].map((t) =>
                        <span key={(d.id.toString() + "_" + t) as React.Key} className="tag is-light">
                          {t}
                        </span>
                      )}
                    </div>}

                    <div id={"edit_form_" + d.id.toString()} className={"container " + (this.state.open_forms_ids.has(d.id) ? "" : "is-hidden")}>
                      <Edit {...{
                        id: d.id,
                        text: d.value,
                        tags: [...d.tags].join(", "),
                        handleSubmit: this.handleSubmit,
                        handleDelete: this.handleDelete,
                        handleHide: this.handleHide,
                      }} />
                    </div>

                  </div>)}
              </div>
            </div>
          </div>

          <div id="new" className={"container p-4 " + (this.state.active_tab == "new" ? "" : "is-hidden")}>
            <Edit {...newProps} />
          </div>

          <div id="about" className={"container p-4 " + (this.state.active_tab == "about" ? "" : "is-hidden")}>
            <div className="container">
              <p>Use left and right mouse clicks on the all tags list to include or exclude tags from search.</p>
              <p>The save file on your system is located here: {this.state.db_path}</p>
            </div>
          </div>
        </div>
      );
  }
}

export default App;
