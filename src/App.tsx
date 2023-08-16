import { Component } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import Icon from '@mdi/react';
import { mdiRefresh } from '@mdi/js';

type AppState = {
  notes: Array<{key: React.Key, value: String, tags: Array<String>}>,
  all_tags: Array<String>,
  yes_tags: Array<String>,
  no_tags: Array<String>,
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
    };

    this.updateNotes = this.updateNotes.bind(this);
    this.setAllTags = this.setAllTags.bind(this);
    this.handleTagLeftClick = this.handleTagLeftClick.bind(this);
    this.handleTagRightClick = this.handleTagRightClick.bind(this);
    this.handleTagClick = this.handleTagClick.bind(this);
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

  render() {
      return (
        <div className="block">
        <div className="tabs is-centered is-large m-4">
          <ul>
            <li className="is-active"><a>Notes</a></li>
            <li><a>New</a></li>
            <li><a>About</a></li>
          </ul>
        </div>
  
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
      );
  }
}

export default App;
