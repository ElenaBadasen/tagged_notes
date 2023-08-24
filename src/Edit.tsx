import { Component } from "react";
import { confirm } from '@tauri-apps/api/dialog';

type EditState = {
    form_submitted: boolean,
    submit_success: boolean,
    form_errors: string,
    new_note_text: string,
    new_note_tags: string,
    timer: ReturnType<typeof setTimeout> | null,
}

interface EditProps {
    id: null | number,
    text: string,
    tags: string,
    handleSubmit: (id: null | number, note: string, tags: string) => Promise<string>,
    handleHide?: (id: number) => void,
    handleDelete?: (id: number) => Promise<string>,
}

class Edit extends Component<EditProps, EditState> {
    constructor (props: EditProps){
        super(props);
        this.state = {
            form_submitted: false,
            submit_success: true,
            form_errors: "",
            timer: null,
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

    handleNewNoteTagsChange = (e: React.FormEvent<HTMLInputElement>) => {
        this.setState({new_note_tags: e.currentTarget.value || ""});
    }

    handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        if (this.state.timer) {
          clearTimeout(this.state.timer);
        }
        e.preventDefault();
        this.props.handleSubmit(
            this.props.id,
            this.state.new_note_text,
            this.state.new_note_tags,
        ).then((_) => {
          let timer: ReturnType<typeof setTimeout>;
          this.setState({
            form_submitted: true,
            submit_success: true,
            form_errors: "",
          }, () => {
            timer = setTimeout(() => {
              this.setState({
                form_submitted: false,
                submit_success: true,
                form_errors: "",
              });
            }, 5000);
            if (!this.props.id) {
              this.setState({
                  new_note_tags: "",
                  new_note_text: "",
                  timer: timer,
              });
            }
          });
            
        })
        .catch((error) => {
          this.setState({
            form_submitted: true,
            submit_success: false,
            form_errors: error.message,
          });
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
      if (this.props.id && this.props.handleHide) {
        this.props.handleHide(
          this.props.id,
        );
      }
    }

    handleDelete = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
      e.preventDefault();
      confirm('Are you sure you want to delete it?').then((result) => {
        if (result) {
          if (this.props.id && this.props.handleDelete) {
            this.props.handleDelete (
              this.props.id,
            ).then((_) => {
              this.setState({
                  form_submitted: true,
                  submit_success: true,
                  new_note_tags: "",
                  new_note_text: "",
                  form_errors: "",
              });
            })
            .catch((error) => {
                this.setState({
                    form_submitted: true,
                    submit_success: false,
                    form_errors: error.message,
                });
            });
          }
        }
      });
    }

    render() {
        const id1 = "text_field_" + this.props.id;
        const id2 = "tags_field_" + this.props.id;
        return (
            <div className="container">
              <form onSubmit={this.handleSubmit}>
                <div className="container">
                  <div className="field">
                    <div className="container mb-2"><label htmlFor={id1}>Note text</label></div>
                    <div className="control">
                      <textarea
                        id={id1}
                        className="textarea"
                        value={this.state.new_note_text}
                        placeholder="Note text"
                        onChange={this.handleNewNoteTextChange}
                      ></textarea>
                    </div>
                  </div>
                  <div className="field">
                    <div className="container mb-2"><label htmlFor={id2}>Tags separated by commas</label></div>
                    <div className="control">
                      <input
                        id={id2}
                        className="input"
                        value={this.state.new_note_tags}
                        placeholder="Tags separated by commas"
                        onChange={this.handleNewNoteTagsChange}
                      />
                    </div>
                  </div>

                  <div className="buttons">
                    {this.props.id && <button className="button is-rounded" onClick={this.handleCancel}>Cancel</button>}
                    <button className="button is-rounded" type="submit">{this.props.id ? "Save" : "Create"}</button>
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
