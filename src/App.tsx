import { Component } from "react";
import { invoke } from "@tauri-apps/api/tauri";

type AppState = {
  notes: Array<{key: React.Key, value: String}>,
}

class App extends Component<{}, AppState> {
  componentWillMount() {
    this.setState({notes: []});
  }

  componentDidMount() {
    invoke("notes").then((result) => {
      let notes = result as Array<{key: React.Key, value: String}>;
      this.setState({notes: notes});
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
  
        </div>
      </div>
      );
  }
}

export default App;
