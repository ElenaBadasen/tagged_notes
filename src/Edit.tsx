import { Component } from "react";
import { confirm } from '@tauri-apps/api/dialog';

type EditState = {
    form_submitted: boolean,
    submit_success: boolean,
    form_errors: string,
    new_note_text: string,
    new_note_tags: string,
}

interface EditProps {
    id: null | number,
    text: string,
    tags: string,
    handleSubmit: (id: null | number, note: string, tags: string) => Promise<string>,
    handleHide: (id: null | number) => void,
    handleDelete: (id: null | number) => Promise<string>,
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
        this.handleCancel = this.handleCancel.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    handleNewNoteTextChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
        this.setState({new_note_text: e.currentTarget.value || ""});
    }
    
    handleNewNoteTagsChange = (e: React.FormEvent<HTMLTextAreaElement>) => {
        this.setState({new_note_tags: e.currentTarget.value || ""});
    }

    handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        this.props.handleSubmit(
            this.props.id, 
            this.state.new_note_text,
            this.state.new_note_tags,    
        ).then((errors) => {
          if (errors.length == 0) {
            this.setState({
              form_submitted: true,
              submit_success: true,
              form_errors: "",
            });
            if (!this.props.id) {
              this.setState({
                  new_note_tags: "",
                  new_note_text: "",
              });
            }
          } else {
              this.setState({
                  form_submitted: true,
                  submit_success: false,
                  form_errors: errors,
              });
          }
        });
    }

    handleCancel = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      this.setState({
        form_submitted: false,
        submit_success: true,
        form_errors: "",
        new_note_text: this.props.text,
        new_note_tags: this.props.tags,
      });
      this.props.handleHide(
        this.props.id, 
      );
    }

    handleDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      confirm('Are you sure you want to delete it?').then((result) => {
        if (result) {
          this.props.handleDelete (
            this.props.id, 
          ).then((errors) => {
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
          });
        }
      });
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

                  <div className="buttons">
                    {this.props.id && <button className="button is-rounded" onClick={this.handleCancel}>Cancel</button>}
                    <button className="button is-rounded" type="submit">Submit</button>
                    {this.props.id && <button className="button is-rounded is-danger"  onClick={this.handleDelete}>Delete</button>}
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