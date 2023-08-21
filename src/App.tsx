import { Component } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Icon from '@mdi/react';
import { mdiRefresh, mdiPencil } from '@mdi/js';
import Edit from "./Edit";

type AppState = {
  notes: Array<{id: number, value: string, tags: Array<string>}>,
  selected_notes: Array<{id: number, value: string, tags: Array<string>}>,
  all_tags: Array<string>,
  yes_tags: Array<string>,
  no_tags: Array<string>,
  new_note_text: string,
  new_note_tags: string,
  dir_path: string,
}

interface AppProps {
}

class App extends Component<{}, AppState> {
  constructor (props: AppProps){
    super(props);

    this.state = {
      notes: [],
      selected_notes: [],
      all_tags: [],
      yes_tags: [],
      no_tags: [],
      new_note_text: "",
      new_note_tags: "",
      dir_path: "",
    };

    this.updateNotesAndTags = this.updateNotesAndTags.bind(this);
    this.handleTagLeftClick = this.handleTagLeftClick.bind(this);
    this.handleTagRightClick = this.handleTagRightClick.bind(this);
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
    let self = this;
    invoke("dir_path").then((result) => {
      self.setState({dir_path: result as string});
    });
  }

  updateNotesAndTags() {
    let self = this;
    invoke("notes").then((result) => {
      let notes = result as Array<{id: number, value: string, tags: Array<string>}>;
      let all_tags = notes
        .map(function(n){ return n.tags })
        .flat()
        .filter((item, i, arr) => {
          let elem = arr.find(t => t === item);
          if (elem) {
            return arr.indexOf(elem) === i;
          } else {
            return false;
          }
        })
        .sort();
      self.setState({notes: notes, all_tags: all_tags}, () => {
        self.updateSelectedNotes();
      });
    });
  }

  updateSelectedNotes() {
    let selected_notes;
    if (this.state.yes_tags.length == 0 && this.state.no_tags.length == 0) {
      selected_notes = this.state.notes;
    } else {
      selected_notes = this.state.notes.filter((note) => {
        let included_tags_found = false;
        for (let t of this.state.yes_tags) {
          if (note.tags.includes(t)) {
            included_tags_found = true;
            break;
          }
        };
        let excluded_tags_found = false;
        if (included_tags_found || this.state.yes_tags.length == 0) {
          for (let t of this.state.no_tags) {
            if (note.tags.includes(t)) {
              excluded_tags_found = true;
              break;
            }
          };
        }
        return (included_tags_found || this.state.yes_tags.length == 0) && !excluded_tags_found;
      });
    }
    this.setState({selected_notes: selected_notes});
  }

  handleRefreshClick = (_e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    let self = this;
    this.setState({
      yes_tags: [],
      no_tags: [],
    }, () => {
      self.updateSelectedNotes();
    });
  }

  handleTagClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    if (e.type === 'click') {
      this.handleTagLeftClick(e);
    } else if (e.type === 'contextmenu') {
      this.handleTagRightClick(e);
    }
  }

  handleTagLeftClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    let target = e.currentTarget as Element;
    let value: string = target.textContent || "";
    let yes_tags = this.state.yes_tags;
    const index = yes_tags.indexOf(value, 0);
    if (index > -1) {
      yes_tags.splice(index, 1);
    } else {
      let no_tags = this.state.no_tags;
      const index2 = no_tags.indexOf(value, 0);
      if (index2 > -1) {
        no_tags.splice(index2, 1);
        this.setState({no_tags: no_tags});
      }
      yes_tags.push(value);
    }
    this.setState({yes_tags: yes_tags}, () => {
      this.updateSelectedNotes();
    });
    e.preventDefault();
  }

  handleTagRightClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    let target = e.currentTarget as Element;
    let value: string = target.textContent || "";
    let no_tags = this.state.no_tags;
    const index = no_tags.indexOf(value, 0);
    if (index > -1) {
      no_tags.splice(index, 1);
    } else {
      let yes_tags = this.state.yes_tags;
      const index2 = yes_tags.indexOf(value, 0);
      if (index2 > -1) {
        yes_tags.splice(index2, 1);
        this.setState({yes_tags: yes_tags});
      }
      no_tags.push(value);
    }
    this.setState({no_tags: no_tags}, () => {
      this.updateSelectedNotes();
    });
    e.preventDefault();
  }

  handleTabClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    let target = e.currentTarget as Element;
    let id = target.id;
    target.classList.add("is-active");
    ["notes", "new", "about"].forEach((elem) => {
      if (id == elem + "-tab") {
        document.getElementById(elem)?.classList.remove("is-hidden");
      } else {
        document.getElementById(elem)?.classList.add("is-hidden");
        document.getElementById(elem + "-tab")?.classList.remove("is-active");
      }
    });
  }

  handleEditClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    let target = e.currentTarget as Element;
    let id = target.id;
    if (id) {
      let item_id = id.split("_")[1];
      if (item_id) {
        let form_id = "edit_form_" + item_id;
        document.getElementById(form_id)?.classList.remove("is-hidden");
      }
    }
  }

  handleSubmit = (id: null | number, note: string, tags: string): Promise<string> => {
    let result;
    let self = this;
    if (id) {
      result = invoke("update", {id: id, note: note, tags: tags}).then((result) => {
        if ((result as string).length == 0) {
          self.handleHide(id);
          self.updateNotesAndTags();
        }
        return result as string;
      });
    } else {
      result = invoke("insert", {note: note, tags: tags}).then((result) => {
        if ((result as string).length == 0) {
          self.updateNotesAndTags();
        }
        return result as string;
      });
    }
    return result;
  }

  handleDelete = (id: null | number): Promise<string> => {
    let self = this;
    if (id) {
      return invoke("delete", {id: id}).then((result) => {
        if ((result as string).length == 0) {
          self.updateNotesAndTags();
        }
        return result as string;
      });
    } else {
      return new Promise<string>(() => "No id for delete");
    }
  }

  handleHide = (id: null | number) => {
    if (id) {
      let form_id = "edit_form_" + id;
      document.getElementById(form_id)?.classList.add("is-hidden");
    }
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
              <li id="notes-tab" className="is-active" onClick={this.handleTabClick}><a>Notes</a></li>
              <li id="new-tab" onClick={this.handleTabClick}><a>New</a></li>
              <li id="about-tab" onClick={this.handleTabClick}><a>About</a></li>
            </ul>
          </div>
    
          <div id="notes" className="container p-4">
            <div className="container has-text-centered">
              {this.state.all_tags.length > 0 && <div className="tags is-centered">
                {this.state.all_tags.map((t) =>
                  <span className={"tag is-light is-medium is-clickable" + 
                    (this.state.yes_tags.includes(t) ? " is-primary" : (this.state.no_tags.includes(t) ? " is-warning" : ""))} 
                    onClick={this.handleTagClick} 
                    onContextMenu={this.handleTagClick}
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
              {this.state.selected_notes.length == 0  && 
              <div className="container mt-4">
                No notes selected
              </div>}
              <div className="block has-text-left m-6">
                {this.state.selected_notes.map((d) => 
                  <div key={d.id.toString() as React.Key} className="block">
                    <div className="block mb-4">
                      {d.value}
                      <span id={"edit_" + d.id.toString()} className="ml-2 is-clickable" onClick={this.handleEditClick} >
                        <Icon path={mdiPencil} size={0.7} />
                      </span>
                    </div>
                    {d.tags.length > 0 && <div className="tags">
                      {d.tags.map((t) =>
                        <span key={(d.id.toString() + "_" + t) as React.Key} className="tag is-light">
                          {t}
                        </span>
                      )}
                    </div>}
                  
                    <div id={"edit_form_" + d.id.toString()} className="container is-hidden">
                      <Edit {...{id: d.id, 
                        text: d.value,
                        tags: d.tags.join(", "),
                        handleSubmit: this.handleSubmit,
                        handleDelete: this.handleDelete,
                        handleHide: this.handleHide,
                      }} />
                    </div> 
                    
                  </div>)}
              </div>
            </div>
          </div>

          <div id="new" className="container is-hidden p-4">
            <Edit {...newProps} />
          </div>

          <div id="about" className="container is-hidden p-4">
            <div className="container">
              <p>Use left and right mouse clicks on the all tags list to include or exclude tags from search.</p>
              <p>The save file on your system is located here: {this.state.dir_path}</p>
            </div>
          </div>
        </div>
      );
  }
}

export default App;
