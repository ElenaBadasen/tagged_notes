import { Component } from "react";
import { invoke } from "@tauri-apps/api/tauri";

type AppState = {
  notes: Array<{key: React.Key, value: String}>,
}

interface AppProps {
}

class App extends Component<{}, AppState> {
  constructor (props: AppProps){
    super(props);
    this.updateNotes = this.updateNotes.bind(this);
  }

  componentWillMount() {
    this.setState({notes: []});
  }

  componentDidMount() {
    this.updateNotes();
  }

  updateNotes() {
    console.log("HER1");
    let self = this;
    invoke("notes").then((result) => {
      console.log("HERE2", result, self);
      let notes = result as Array<{key: React.Key, value: String}>;
      self.setState({notes: notes});
    });
  }

  render() {
      return (
        <div className="block">
        <div className="tabs is-centered is-large">
          <ul>
            <li className="is-active"><a>Notes</a></li>
            <li><a>New</a></li>
            <li><a>About</a></li>
          </ul>
        </div>
  
        <div className="container has-text-centered">
          <div className="block">
            {this.state.notes.map((d) => <li key={d.key}>{d.value}</li>)}
          </div>
          <button className="button" onClick={this.updateNotes}>Refresh</button>
        </div>
      </div>
      );
  }
}

export default App;
