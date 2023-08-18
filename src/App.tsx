import { Component } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Icon from '@mdi/react';
import { mdiRefresh, mdiPencil } from '@mdi/js';
import Edit from "./Edit";

type AppState = {
  notes: Array<{id: Number, value: String, tags: Array<String>}>,
  all_tags: Array<String>,
  yes_tags: Array<String>,
  no_tags: Array<String>,
  form_submitted: boolean,
  submit_success: boolean,
  form_errors: String,
  new_note_text: String,
  new_note_tags: String,
}

interface AppProps {
}

class App extends Component<{}, AppState> {
  constructor (props: AppProps){
    super(props);

    this.state = {
      notes: [],
      all_tags: [],
      yes_tags: [],
      no_tags: [],
      form_submitted: false,
      submit_success: true,
      form_errors: "",
      new_note_text: "",
      new_note_tags: "",
    };

    this.updateNotes = this.updateNotes.bind(this);
    this.setAllTags = this.setAllTags.bind(this);
    this.handleTagLeftClick = this.handleTagLeftClick.bind(this);
    this.handleTagRightClick = this.handleTagRightClick.bind(this);
    this.handleTagClick = this.handleTagClick.bind(this);
    this.handleTabClick = this.handleTabClick.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleDelete = this.handleDelete.bind(this);
    this.handleHide = this.handleHide.bind(this);
  }

  componentDidMount() {
    this.updateNotes();
    this.setAllTags();
  }

  updateNotes() {
    let self = this;
    invoke("notes").then((result) => {
      let notes = result as Array<{id: Number, value: String, tags: Array<String>}>;
      self.setState({notes: notes});
    });
  }

  setAllTags() {
    let self = this;
    invoke("all_tags").then((result) => {
      let all_tags = result as Array<String>;
      self.setState({all_tags: all_tags});
    });
  }

  handleRefreshClick = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    this.setState({
      yes_tags: [],
      no_tags: [],
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
    let value: String = target.textContent || "";
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
    this.setState({yes_tags: yes_tags});
    e.preventDefault();
  }

  handleTagRightClick(e: React.MouseEvent<HTMLLIElement, MouseEvent>) {
    let target = e.currentTarget as Element;
    let value: String = target.textContent || "";
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
    this.setState({no_tags: no_tags});
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

  handleSubmit = (id: null | Number, note: String, tags: String) => {
    //TODO
    return ""
  }

  handleDelete = (id: null | Number) => {
    //TODO
    return ""
  }

  handleHide = (id: null | Number) => {
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
    
          <div id="notes" className="container">
            <div className="container has-text-centered">
              <div className="tags is-centered">
                {this.state.all_tags.map((t) =>
                  <span className={"tag is-light is-medium is-clickable" + 
                    (this.state.yes_tags.includes(t) ? " is-primary" : (this.state.no_tags.includes(t) ? " is-warning" : ""))} 
                    onClick={this.handleTagClick} 
                    onContextMenu={this.handleTagClick}
                    key={t as React.Key}>
                    {t}
                  </span>
                )}
                <span key = "__refresh" className="m-1 is-clickable" onClick={this.handleRefreshClick} >
                  <Icon path={mdiRefresh} size={1} />
                </span>
                
              </div>
            </div>

            <div className="container has-text-centered">
              <div className="block has-text-left m-6">
                {this.state.notes.map((d) => 
                  <div key={d.id.toString() as React.Key} className="block">
                    <div className="block mb-4">
                      {d.value}
                      <span id={"edit_" + d.id.toString()} className="ml-2 is-clickable" onClick={this.handleEditClick} >
                        <Icon path={mdiPencil} size={0.7} />
                      </span>
                    </div>
                    <div className="tags">
                      {d.tags.map((t) =>
                        <span key={(d.id.toString() + "_" + t) as React.Key} className="tag is-light">
                          {t}
                        </span>
                      )}
                    </div>
                  
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
              <button className="button" onClick={this.updateNotes}>Refresh</button>
            </div>
          </div>

          <div id="new" className="container is-hidden">
            <Edit {...newProps} />
          </div>

          <div id="about" className="container is-hidden">
            <div className="container">
              Some text about this project. Some more text, and a bit more.
            </div>
          </div>
        </div>
      );
  }
}

export default App;
