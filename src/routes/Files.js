import React from 'react';
import { Route, NavLink, Switch, Redirect } from 'react-router-dom';

export default class Files extends React.Component {
  render() {
    //console.log("rendering the AdminComponent");
    return (
      <div className="content container files-page body-content">
        <div >
          <div><h4 className="mb-0">Мои файлы</h4></div>
          <div>
            <div className="row">
              <div className="col-sm-9">
                <FilesForm history={this.props.history} />
              </div>
              <div className="col-sm-3">
                <ul className="nav nav-tabs">
                  <li className="nav-item"><NavLink exact activeClassName="nav-link active" className="nav-link" activeStyle={{color:"black"}} to="/panel/common/files/all" replace>Все</NavLink></li>
                  <li className="nav-item"><NavLink activeClassName="nav-link active" className="nav-link" activeStyle={{color:"black"}} to="/panel/common/files/images" replace>Изображении</NavLink></li>
                </ul>
              </div>
            </div>
            <Switch>
              <Route path="/panel/common/files/all" exact render={(props) =>(
                <AllFiles {...props} breadCrumbs={this.props.breadCrumbs.bind(this)} />
              )} />
              <Route path="/panel/common/files/images" exact render={(props) =>(
                <Images {...props} breadCrumbs={this.props.breadCrumbs.bind(this)} />
              )} />
              <Redirect from="/panel/common/files" to="/panel/common/files/all" />
            </Switch>
          </div>
        </div>
      </div>
    )
  }
}

class Images extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      images: []
    };

  }

  componentWillMount() {
    //console.log("AdminComponent will mount");

  }

  componentDidMount() {
    this.props.breadCrumbs();
    this.getImages();
  }

  componentWillUnmount() {
    //console.log("AdminComponent will unmount");
  }

  getImages() {
    console.log("getFiles started");
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/file/images", true);
    //Send the proper header information along with the request
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      if (xhr.status === 200) {
        this.setState({ images: JSON.parse(xhr.responseText) });
      } else {
        console.log(xhr.response);
        // alert("Ошибка " + xhr.status + ': ' + xhr.statusText);
      }
    }.bind(this)
    // console.log(data);
    xhr.send();
  }

  // Скачивание файла
  downloadFile(id) {
    var token = sessionStorage.getItem('tokenInfo');

    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + 'api/file/download/' + id, true);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          var base64ToArrayBuffer = (function () {
        
            return function (base64) {
              var binaryString = window.atob(base64);
              var binaryLen = binaryString.length;
              var bytes = new Uint8Array(binaryLen);
              
              for (var i = 0; i < binaryLen; i++) {
                var ascii = binaryString.charCodeAt(i);
                bytes[i] = ascii;
              }
              
              return bytes; 
            }
            
          }());

          var saveByteArray = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            
            return function (data, name) {
              var blob = new Blob(data, {type: "octet/stream"}),
                  url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = name;
              a.click();
              setTimeout(function() {window.URL.revokeObjectURL(url);},0);
            };

          }());

          saveByteArray([base64ToArrayBuffer(data.file)], data.file_name);
        } else {
          alert('Не удалось скачать файл');
        }
      }
    xhr.send();
  }

  render() {
    return (
      <div>
          <div className="container">
           <div className="panel panel-info">
            <div className="card-deck">

              {this.state.images.map(function(image, index){
                  return(
                    <div className="card" key={index}>
                      <div className="image-thumbnail">
                        <div style={{background: 'url(data:' + image.ContentType + ';base64,' + image.base64 + ') center center'}}></div>
                      </div>
                      <div className="card-body">
                        <h4 className="card-title">{image.name}</h4>
                        <p className="card-text">{image.description}</p>
                      </div>
                      <div className="card-footer">
                        <button type="button" className="btn btn-outline-primary" onClick={this.downloadFile.bind(this, image.id)}>
                          Скачать
                        </button>
                      </div>
                    </div>
                  );
                }.bind(this))
              }

            </div>
          </div>
        </div>
       </div>
    )
  }
}

class AllFiles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      files: [],
      roles: sessionStorage.getItem('userRoles')
    };

  }

  componentWillMount() {
    //console.log("AdminComponent will mount");

  }

  componentDidMount() {
    this.props.breadCrumbs();
    this.getFiles();
  }

  componentWillUnmount() {
    //console.log("AdminComponent will unmount");
  }

  getFiles() {
    console.log("getFiles started");
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/file/all", true);
      //Send the proper header information along with the request
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function() {
        console.log(JSON.parse(xhr.responseText));
        if (xhr.status === 200) {
          this.setState({ files: JSON.parse(xhr.responseText) });
        } else {
          console.log(xhr.response);
          // alert("Ошибка " + xhr.status + ': ' + xhr.statusText);
        }
      }.bind(this)
      // console.log(data);
      xhr.send();
  }

  // Скачивание файла
  downloadFile(id) {
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + 'api/file/download/' + id, true);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          var base64ToArrayBuffer = (function () {
        
            return function (base64) {
              var binaryString = window.atob(base64);
              var binaryLen = binaryString.length;
              var bytes = new Uint8Array(binaryLen);
              
              for (var i = 0; i < binaryLen; i++) {
                var ascii = binaryString.charCodeAt(i);
                bytes[i] = ascii;
              }
              
              return bytes; 
            }
            
          }());

          var saveByteArray = (function () {
            var a = document.createElement("a");
            document.body.appendChild(a);
            a.style = "display: none";
            
            return function (data, name) {
              var blob = new Blob(data, {type: "octet/stream"}),
                  url = window.URL.createObjectURL(blob);
              a.href = url;
              a.download = name;
              a.click();
              setTimeout(function() {window.URL.revokeObjectURL(url);},0);
            };

          }());

          saveByteArray([base64ToArrayBuffer(data.file)], data.file_name);
        } else {
          alert('Не удалось скачать файл');
        }
      }
    xhr.send();
  }

  deleteFile(event) {
    var id =  event.target.getAttribute("data-id");
    var name =  event.target.getAttribute("data-name");
    var token = sessionStorage.getItem('tokenInfo');
    
    if (!window.confirm('Вы действительно хотите удалить файл "' + name + '"?')) {
      return false;
    }

    var xhr = new XMLHttpRequest();
    xhr.open("post", window.url + "api/file/delete/" + id, true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      if (xhr.status === 200) {
        this.getFiles();
      }
    }.bind(this)
    xhr.send();
  } 

  render() {
    return (
      <table className="table">
        <thead>
          <tr>
            <th style={{width: '25%'}}>Название</th>
            <th style={{width: '25%'}}>Категория</th>
            <th style={{width: '33.33333%'}}>Описание</th>
            <th style={{width: '16.66667%'}}>Управление</th>
          </tr>
        </thead>
        <tbody>
          {this.state.files.map(function(file, index){
            return(
              <tr key={index}>
                <td>{file.name}</td>
                <td>
                  {file.category &&
                    file.category.name_ru
                  }
                </td>
                <td>{file.description}</td>
                <td>
                  <a className="pointer control_buttons" title="Скачать" data-id={file.id} onClick={this.downloadFile.bind(this, file.id)}>
                    Скачать 
                  </a>

                  {this.state.roles.indexOf('Admin') !== -1 &&
                    <a className="pointer control_buttons" data-name={file.name} data-id={file.id} onClick={this.deleteFile.bind(this)}>
                      Удалить
                    </a>
                  }
                </td>
              </tr>
              );
            }.bind(this))
          }
        </tbody>
      </table>
    )
  }
}

class FilesForm extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      file: [],
      categories: [],
      name: "", 
      category: "", 
      description: ""
    }

    this.onFileChange = this.onFileChange.bind(this);
    this.onNameChange = this.onNameChange.bind(this);
    this.onCategoryChange = this.onCategoryChange.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.uploadFile = this.uploadFile.bind(this);
    this.getCategories = this.getCategories.bind(this);
  }

  onFileChange(e) {
    this.setState({ file: e.target.files[0] });
  }

  onNameChange(e) {
    this.setState({ name: e.target.value });
  }

  onCategoryChange(e) {
    this.setState({ category: e.target.value });
  }

  onDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  componentWillMount() {
    this.getCategories();
  }

  uploadFile() {
    // console.log("uploadFile function started");
    
    var file = this.state.file;
    var name = this.state.name;
    var category = this.state.category;
    var description = this.state.description;
    var token = sessionStorage.getItem('tokenInfo');

    var registerData = {
      file: file,
      name: name,
      category: category,
      description: description
    };

    var formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    formData.append('category', category);
    formData.append('description', description);

    var data = JSON.stringify(registerData);

    if (!file || !name || !category || !description) {
      return;
    } 
    else 
    {
      var xhr = new XMLHttpRequest();
      xhr.open("post", window.url + "api/file/upload", true);
      //Send the proper header information along with the request
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      //xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          document.getElementById('uploadFileModalClose').click();
          alert("Файл успешно загружен")
        } else {
          console.log(xhr.response);
          // alert("Ошибка " + xhr.status + ': ' + xhr.statusText);
        }
      }.bind(this)
      console.log(data);
      xhr.send(formData);
    }
  }

  getCategories() {
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/file/categoriesList", true);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          this.setState({ categories: JSON.parse(xhr.responseText) });
        } else {
          console.log(xhr.response);
        }
      }.bind(this)
      xhr.send();
  }

  render() {
    return(
      <div>
        <button className="btn btn-outline-primary mt-3" data-toggle="modal" data-target="#uploadFileModal">
          Добавить файл
        </button>
        <div className="modal fade" id="uploadFileModal" tabIndex="-1" role="dialog" aria-hidden="true">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <form>
                <div className="modal-header">
                  <h5 className="modal-title">Загрузить файл</h5>
                  <button type="button" id="uploadFileModalClose" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label htmlFor="upload_name">Название</label>
                    <input type="text" className="form-control" id="upload_name" placeholder="Название" value={this.state.name} onChange={this.onNameChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="upload_category">Категория</label>
                    <select className="form-control" id="upload_category" onChange={this.onCategoryChange}>
                      <option value="" selected disabled>Выберите категорию</option>
                      {
                        this.state.categories.map(function(category, index)
                          {
                            return(
                              <option value={category.id}  key={index}>{category.name_ru}</option>
                            )
                          }
                        )
                      }
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="upload_description">Описание</label>
                    <textarea className="form-control" id="upload_description" value={this.state.description} onChange={this.onDescriptionChange} placeholder="Описание"></textarea>
                  </div>
                  <div className="form-group">
                    <label htmlFor="upload_file">Файл</label>
                    <input type="file" id="upload_file" className="form-control" onChange={this.onFileChange} />
                  </div>
                </div>
                <div className="modal-footer">
                  <input type="button" onClick={this.uploadFile} className="btn btn-primary" value="Загрузить" />
                  <button type="button" className="btn btn-secondary" data-dismiss="modal">Закрыть</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      )
  }
}