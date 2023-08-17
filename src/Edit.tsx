import { Component } from "react";

type EditState = {
    form_submitted: boolean,
    submit_success: boolean,
    form_errors: String,
    new_note_text: String,
    new_note_tags: String,
}

interface EditProps {
    text: String,
    tags: String,
    handleSubmit: (id: null | number, note: String, tags: String) => string,
}

class Edit extends Component<EditProps, EditState> {
    constructor (props: EditProps){
        super(props);
        this.state = {
            form_submitted: false,
            submit_success: true,
            form_errors: "",
            new_note_text: props.text,
            new_note_tags: props.tags,
        };
        this.handleNewNoteTextChange = this.handleNewNoteTextChange.bind(this);
        this.handleNewNoteTagsChange = this.handleNewNoteTagsChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleNewNoteTextChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({new_note_text: e.currentTarget.value || ""});
    }
    
    handleNewNoteTagsChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({new_note_tags: e.currentTarget.value || ""});
    }

    handleSubmit = (e: React.FormEvent<HTMLInputElement>) => {
        event.preventDefault();
        const errors = this.props.handleSubmit(
            Number(e.currentTarget.name), 
            this.state.new_note_text,
            this.state.new_note_tags,    
        );
        if (errors.length == 0) {
            this.setState({
                form_submitted: true,
                submit_success: true,
                new_note_tags: "",
                new_note_text: "",
                form_errors: "",
            });
        } else {
            this.setState({
                form_submitted: true,
                submit_success: false,
                form_errors: errors,
            });
        }
    }

    render() {
        return (
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
        );
    }

}

export default Edit;