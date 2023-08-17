import { Component } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Icon from '@mdi/react';
import { mdiRefresh } from '@mdi/js';

type AppState = {
  notes: Array<{key: React.Key, value: String, tags: Array<String>}>,
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
    this.handleNewNoteTextChange = this.handleNewNoteTextChange.bind(this);
    this.handleNewNoteTagsChange = this.handleNewNoteTagsChange.bind(this);
  }

  componentDidMount() {
    this.updateNotes();
    this.setAllTags();
  }

  updateNotes() {
    let self = this;
    invoke("notes").then((result) => {
      let notes = result as Array<{key: React.Key, value: String, tags: Array<String>}>;
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

  handleRefreshClick = (e: Event) => {
    this.setState({
      yes_tags: [],
      no_tags: [],
    });
  }

  handleTagClick = (e: Event) => {
    if (e.type === 'click') {
      this.handleTagLeftClick(e);
    } else if (e.type === 'contextmenu') {
      this.handleTagRightClick(e);
    }
  }

  handleTagLeftClick(e: Event) {
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

  handleTagRightClick(e: Event) {
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

  handleTabClick = (e: Event) => {
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

  handleSubmit = (e: Event) => {
    e.preventDefault();
    this.setState({
      form_submitted: true,
      submit_success: true,
      new_note_tags: "",
      new_note_text: "",
    });
  }

  handleNewNoteTextChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({new_note_text: e.currentTarget.value || ""});
  }

  handleNewNoteTagsChange = (e: React.FormEvent<HTMLInputElement>) => {
    this.setState({new_note_tags: e.currentTarget.value || ""});
  }

  render() {
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
                  <div key={d.key} className="block">
                    <div className="block mb-4">
                      {d.value}
                    </div>
                    <div className="tags">
                      {d.tags.map((t) =>
                        <span key={t as React.Key} className="tag is-light">
                          {t}
                        </span>
                      )}
                    </div>
                  </div>)}
              </div>
              <button className="button" onClick={this.updateNotes}>Refresh</button>
            </div>
          </div>

          <div id="new" className="container is-hidden">
            <div className="container">
              <form onSubmit={this.handleSubmit}>
                <div className="container">
                  <div className="field">
                    <div className="control">
                      <textarea 
                        className="textarea" 
                        value={this.state.new_note_text as string} 
                        placeholder="Note text"
                        onChange={this.handleNewNoteTextChange}
                      ></textarea>
                    </div>
                  </div>
                  <div className="field">
                    <div className="control">
                      <textarea 
                        className="textarea" 
                        value={this.state.new_note_tags as string} 
                        placeholder="Tags separated by commas"
                        onChange={this.handleNewNoteTagsChange}
                      ></textarea>
                    </div>
                  </div>

                  <div className="control">
                    <button className="button is-link" type="submit">Submit</button>
                  </div>

                  {this.state.form_submitted && this.state.submit_success && (
                    <div className="container mt-4">
                      The note was successfully saved!
                    </div>
                  )}
                  {this.state.submit_success === false && (
                    <div className="container mt-4">
                      An error occured: {this.state.form_errors}
                    </div>
                  )}
                </div>
              </form>
            </div>
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
