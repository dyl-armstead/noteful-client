import React, {Component} from 'react';
import {Route, Link} from 'react-router-dom';
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import NoteListNav from '../NoteListNav/NoteListNav';
import NotePageNav from '../NotePageNav/NotePageNav';
import NoteListMain from '../NoteListMain/NoteListMain';
import NotePageMain from '../NotePageMain/NotePageMain';
import config from '../config'
import {getNotesForFolder, findNote, findFolder} from '../notes-helpers';
import './App.css';

class App extends Component {
    state = {
        notes: [],
        folders: [],
        match: {
            params:{
                notes:[],
                folders: []
            }
        }
    };

    setNotes = notes => {
        this.setState({
          notes
        })
      }

    setFolders = folders => {
        this.setState({
          folders
        })
    }

    addNote = note => {
        this.setState({
          notes: [ ...this.state.notes, note ],
        })
    }

    addFolder = folder => {
        this.setState({
          folders: [ ...this.state.folders, folder ],
        })
    }

    componentDidMount() {

        fetch(config.NOTES_API_ENDPOINT, {
            method: 'GET',
            headers: {
              'content-type': 'application/json',
            }
          })
            .then(res => {
              if (!res.ok) {
                throw new Error(res.status)
              }
              return res.json()
            })
            .then(this.setNotes)
            .catch(error => this.setState({ error }))


        fetch(config.FOLDERS_API_ENDPOINT, {
          method: 'GET',
          headers: {
            'content-type': 'application/json',
          }
        })
          .then(res => {
            if (!res.ok) {
              throw new Error(res.status)
            }
            return res.json()
          })
          .then(this.setFolders)
          .catch(error => this.setState({ error }))
      }

    renderNavRoutes() {
        const {notes, folders} = this.state;
        return (
            <>
                {['/', '/folder/:folder_id'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => (
                            <NoteListNav
                                folders={folders}
                                notes={notes}
                                {...routeProps}
                            />
                        )}
                    />
                ))}
                <Route
                    path="/note/:notes_id"
                    render={routeProps => {
                        const {note_id} = routeProps.match.params;
                        const note = findNote(notes, note_id) || {};
                        const folder = findFolder(folders, note.folder_id);
                        return <NotePageNav {...routeProps} folder={folder} />;
                    }}
                />
                <Route path="/add-folder" component={NotePageNav} />
                <Route path="/add-note" component={NotePageNav} />
            </>
        );
    }

    renderMainRoutes() {
        const {notes} = this.state;
        return (
            <>
                {['/', '/folder/:folderId'].map(path => (
                    <Route
                        exact
                        key={path}
                        path={path}
                        render={routeProps => {
                            const {folderId} = routeProps.match.params;
                            const notesForFolder = getNotesForFolder(
                                notes,
                                folderId
                            );
                            return (
                                <NoteListMain
                                    {...routeProps}
                                    notes={notesForFolder}
                                />
                            );
                        }}
                    />
                ))}
                <Route
                    path="/note/:noteId"
                    render={routeProps => {
                        const {noteId} = routeProps.match.params;
                        const note = findNote(notes, noteId);
                        return <NotePageMain {...routeProps} note={note} />;
                    }}
                />
            </>
        );
    }

    render() {
        return (
            <div className="App">
                <nav className="App__nav">{this.renderNavRoutes()}</nav>
                <header className="App__header">
                    <h1>
                        <Link to="/">Noteful</Link>{' '}
                        <FontAwesomeIcon icon="check-double" />
                    </h1>
                </header>
                <main className="App__main">{this.renderMainRoutes()}</main>
            </div>
        );
    }
}

export default App;
