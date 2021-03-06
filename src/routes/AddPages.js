import React from 'react';
import { NavLink } from 'react-router-dom';
import LocalizedStrings from 'react-localization';
import {ru, kk} from '../languages/header.json';
import $ from 'jquery';
import { Route, Link,  Switch, Redirect } from 'react-router-dom';
import Loader from 'react-loader-spinner';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import CKEditor from "react-ckeditor-component";
import ReactSummernote from 'react-summernote';
import 'react-summernote/dist/react-summernote.css'; // import styles
import 'react-summernote/lang/summernote-ru-RU'; // you can import any other locale

// Import bootstrap(v3 or v4) dependencies
// import 'bootstrap/js/modal';
// import 'bootstrap/js/dropdown';
// import 'bootstrap/js/tooltip';
// import 'bootstrap/dist/css/bootstrap.css';



let e = new LocalizedStrings({ru,kk});



export default class AddPages extends React.Component{

  constructor() {
    super();
    (localStorage.getItem('lang')) ? e.setLanguage(localStorage.getItem('lang')) : e.setLanguage('ru');

    this.state = {
        tokenExists: false,
        rolename: ""
    }
  }

  render() {
    return (
      <div className="container body-content">
        <div className="content container citizen-apz-list-page">
        <div>

          <div>
            <Switch>
                <Route path="/panel/admin/addPages/all" exact render={(props) =>(
                  <AllPages {...props} breadCrumbs={this.props.breadCrumbs.bind(this)} />
                )} />
                <Route path="/panel/admin/addPages/add" exact render={(props) =>(
                  <AddPage {...props} breadCrumbs={this.props.breadCrumbs.bind(this)} />
                )} />
                <Route path="/panel/admin/addPages/update/:id" exact render={(props) =>(
                  <UpdatePage {...props} breadCrumbs={this.props.breadCrumbs.bind(this)} />
                )} />
                <Redirect from="/panel/admin/addPages" to="/panel/admin/addPages/all" />
            </Switch>
        </div>

        </div>
      </div>

      </div>
    )
  }
}

class AllPages extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pages: [],
      loaderHidden: false
    };

  }

  componentDidMount() {
    this.props.breadCrumbs();
  }
  componentWillMount() {
    this.getPages();
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.match.params.status !== nextProps.match.params.status) {
      this.getPages(nextProps.match.params.status);
    }
  }

  getPages() {
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/addPages", true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);

        this.setState({pages: data.pages});
        this.setState({ loaderHidden: true });
      } else if (xhr.status === 401) {
        sessionStorage.clear();
        alert("Время сессии истекло. Пожалуйста войдите заново!");
        this.props.history.replace("/login");
      } else {
        this.setState({ loaderHidden: true });
      }
    }.bind(this);
    xhr.send();
  }

  delete_article(e) {
    var link = 'api' + $(e.target).attr('data-link');

    if (!window.confirm('Вы действительно хотите удалить данную страницу?')) {
      return false;
    }

    var token = sessionStorage.getItem('tokenInfo');
    if (token){
      var xhr = new XMLHttpRequest();
      xhr.open("get", window.url + link, true);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          alert('Запись была успешно удалена!');
          this.props.history.replace('/panel/admin/addPages');
        } else {
          alert("При удалении произошла ошибка!");
        }
      }.bind(this);
      xhr.send();
    } else {
      alert('Вам нужно переподключится к системе!');
      this.props.history.push('/login');
    }
  }

  render() {
    return (
      <div>
        {this.state.loaderHidden &&
          <div>
            <h3>Добавление страниц</h3>
            <div className="row">
              <div className="col-sm-8">
                <Link className="btn btn-outline-primary mb-3" to="/panel/admin/addPages/add">Создать страницу</Link>
              </div>

            </div>
            <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Индекс</th>
                  <th>Название</th>
                  <th>Описание</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {this.state.pages.map(function(page, index) {
                  if (page.status === 1){

                  return(
                    <tr key={index}>
                      <td >{index+1}</td>
                      <td title={page.title_ru}>{page.title_ru.substr(0,30)} ...</td>
                      <td title={page.description_ru}>{page.description_ru.substr(0,50)} ...</td>

                      <td>
                        <Link className="btn btn-outline-info col-md-8" to={'/panel/admin/addPages/update/' + page.id}>Изменить</Link>
                        <button className="btn btn-outline-danger col-md-8" data-link={'/addPages/delete/' + page.id}
                                onClick={this.delete_article.bind(this)}>Удалить</button>
                      </td>
                    </tr>
                    );
                  }
                  }.bind(this))
                }

                {this.state.pages.length === 0 &&
                  <tr>
                    <td colSpan="3">Пусто</td>
                  </tr>
                }
              </tbody>
            </table>
            </div>
          </div>
        }

        {!this.state.loaderHidden &&
          <div style={{textAlign: 'center'}}>
            <Loader type="Oval" color="#46B3F2" height="100" width="100" />
          </div>
        }
      </div>
    )
  }
}

class AddPage extends React.Component {
    constructor(props) {
    super(props);


    this.state = {
      selectedOptions : '1',
      title_ru : '',
      title_kk : '',
      desc_ru : '',
      desc_kk : '',
      value: '',
      content: '',
      content_kk: '',
      loaderHidden: false
    };
    this.onTextChange = this.onTextChange.bind(this);
    this.onTextChangeKK = this.onTextChangeKK.bind(this);
    this.updateContent = this.updateContent.bind(this);
    this.updateContentKK = this.updateContentKK.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onChangeKK = this.onChangeKK.bind(this);
  }
  componentDidMount () {
    this.props.breadCrumbs();
    $('.note-popover').remove();
  }
  updateContent(newContent) {
    this.setState({
        content: newContent
    })
  }
  updateContentKK(newContent) {
    this.setState({
        content_kk: newContent
    })
  }
  onChange(content) {
    this.setState({content: content})
  }
  onChangeKK(content) {
    this.setState({content_kk: content})
  }

  requestSubmission(e){
    e.preventDefault();
    var page = new Object();
        page.title_ru = this.state.title_ru;
        page.title_kk = this.state.title_kk;
        page.description_ru = this.state.desc_ru;
        page.description_kk = this.state.desc_kk;
        page.content = this.state.content;
        page.content_kk = this.state.content_kk;
        console.log(page);

    if (sessionStorage.getItem('tokenInfo')) {
      $.ajax({
        type: 'POST',
        url: window.url + 'api/addPages/insert',
        contentType: 'application/json; charset=utf-8',
        beforeSend: function (xhr) {
          xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem('tokenInfo'));
        },
        data: JSON.stringify(page),
        success: function (data) {
            console.log(data);
          alert(data.message);
            this.props.history.replace('/panel/admin/addPages/all');
        }.bind(this),
        fail: function (jqXHR) {
          alert("Ошибка " + jqXHR.status + ': ' + jqXHR.statusText);
        },
        complete: function (jqXHR) {
        }
      });
    } else { console.log('session expired'); }
  }

  onTextChange(value){
    this.setState({content: value});
  }
  onTextChangeKK(value){
    this.setState({content_kk: value});
  }

  render() {
      return(
          <div className="container">
              <h4>Форма новой статичной страницы</h4>
              <br/>
              <div className="col-md-12">
                  <form id="insert_form" name="form_aritcle">
                      <div className="form-group">
                          <label htmlFor="title">Название на русском</label>
                          <input type="text" name="title" maxlength="150"
                                 id="title" pleaceholder="Title" className="form-control"
                                 required onChange={(e) => this.setState({title_ru: e.target.value})} />
                      </div>
                      <div className="form-group">
                          <label htmlFor="title">Название на казахском</label>
                          <input type="text" name="title" maxlength="150"
                                 id="title" pleaceholder="Title" className="form-control"
                                 required onChange={(e) => this.setState({title_kk: e.target.value})} />
                      </div>
                      <div className="form-group">
                          <label htmlFor="description">Описание на русском</label>
                          <input type="text" name="description" maxlength="150"
                                 id="description" pleaceholder="Description" className="form-control"
                                 required onChange={(e) => this.setState({desc_ru: e.target.value})} />
                      </div>
                      <div className="form-group">
                          <label htmlFor="description">Описание на казахском</label>
                          <input type="text" name="description" maxlength="150"
                                 id="description" pleaceholder="Description" className="form-control"
                                 required onChange={(e) => this.setState({desc_kk: e.target.value})} />
                      </div>
                      <div className="form-group">
                          <label htmlFor="text">Содержание страницы на русском</label>
                          <ReactSummernote
                            value={this.state.content}
                            options={{
                              // lang: 'ru-RU',
                              height: 350,
                              dialogsInBody: true,
                              toolbar: [
                                ['style', ['style']],
                                ['font', ['bold', 'underline', 'clear']],
                                ['fontname', ['fontname']],
                                ['para', ['ul', 'ol', 'paragraph']],
                                ['table', ['table']],
                                ['insert', ['link', 'picture', 'video']],
                                ['view', ['fullscreen', 'codeview']]
                              ]
                            }}
                            onChange={this.onChange}
                          />
                      </div>
                      <div className="form-group">
                          <label htmlFor="text">Содержание страницы на казахском</label>
                          <ReactSummernote
                            value={this.state.content_kk}
                            options={{
                              // lang: 'ru-RU',
                              height: 350,
                              dialogsInBody: true,
                              toolbar: [
                                ['style', ['style']],
                                ['font', ['bold', 'underline', 'clear']],
                                ['fontname', ['fontname']],
                                ['para', ['ul', 'ol', 'paragraph']],
                                ['table', ['table']],
                                ['insert', ['link', 'picture', 'video']],
                                ['view', ['fullscreen', 'codeview']]
                              ]
                            }}
                            onChange={this.onChangeKK}
                          />
                      </div>
                      <input type="submit" className="btn btn-outline-success" value="Отправить статью" onClick={this.requestSubmission.bind(this)} />
                  </form>
                  <div>
                      <hr />
                      <Link className="btn btn-outline-secondary pull-right" id="back" to={'/panel/admin/addPages/'}><i className="glyphicon glyphicon-chevron-left"></i> Назад</Link>
                  </div>
              </div>
          </div>
      )
  }
}

class UpdatePage extends React.Component {
    constructor(props) {
    super(props);
    this.onTextChange = this.onTextChange.bind(this);
    this.updateContent = this.updateContent.bind(this);
    this.onChange = this.onChange.bind(this);
    this.onTextChangeKK = this.onTextChangeKK.bind(this);
    this.updateContentKK = this.updateContentKK.bind(this);
    this.onChangeKK = this.onChangeKK.bind(this);
    this.state = {
      id : '',
      title_ru : '',
      title_kk : '',
      desc_ru : '',
      desc_kk : '',
      value: '',
      content: false,
      content_kk: false,
      loaderHidden: false
    };
  }
  componentDidMount() {
    this.props.breadCrumbs();
    $('.note-popover').remove();
  }
  componentWillMount() {
    this.getPage();
  }
  getPage() {
    var id = this.props.match.params.id;
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/addPages/show/" + id, true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      if (xhr.status === 200) {
        var article = JSON.parse(xhr.responseText);

        this.setState({id: article.page.id});
        this.setState({title_ru: article.page.title_ru});
        this.setState({title_kk: article.page.title_kk});
        this.setState({desc_ru: article.page.description_ru});
        this.setState({desc_kk: article.page.description_kk});
        this.setState({content: article.page.content});
        this.setState({content_kk: article.page.content_kk});

      } else if (xhr.status === 401) {
        sessionStorage.clear();
        alert("Время сессии истекло. Пожалуйста войдите заново!");
        this.props.history.replace("/login");
      }
    }.bind(this);
    xhr.send();
  }

  requestSubmission(e){
        e.preventDefault();
        var page = new Object();
            page.id = this.state.id;
            page.title_ru = this.state.title_ru;
            page.title_kk = this.state.title_kk;
            page.description_ru = this.state.desc_ru;
            page.description_kk = this.state.desc_kk;
            page.content = this.state.content;
            page.content_kk = this.state.content_kk;
      if (sessionStorage.getItem('tokenInfo')) {
        $.ajax({
          type: 'POST',
          url: window.url + 'api/addPages/update',
          contentType: 'application/json; charset=utf-8',
          beforeSend: function (xhr) {
            xhr.setRequestHeader("Authorization", "Bearer " + sessionStorage.getItem('tokenInfo'));
          },
          data: JSON.stringify(page),
          success: function (data) {
            alert(data.message);
              this.props.history.replace('/panel/admin/addPages/all');
          }.bind(this),
          fail: function (jqXHR) {
            alert("Ошибка " + jqXHR.status + ': ' + jqXHR.statusText);
          },
          complete: function (jqXHR) {
          }
        });
      } else { console.log('session expired'); }
    }

  onTextChange(value){
    this.setState({content: value});
  }
  updateContent(newContent) {
        this.setState({
            content: newContent
        })
  }

  onChange(content) {
    this.setState({content: content})
  }

  onTextChangeKK(value){
    this.setState({content_kk: value});
  }
  updateContentKK(newContent) {
        this.setState({
            content_kk: newContent
        })
  }

  onChangeKK(content) {
    this.setState({content_kk: content})
  }


  render() {
    return(
      <div className="container">
        <h4>Форма исправления статичной страницы</h4>
        <br/>
        <div className="col-md-12">
          <form id="insert_form" name="form_aritcle">
            <div className="form-group">
                <label htmlFor="title">Название на русском</label>
                <input type="text" name="title" maxLength="150"
                       id="title" pleaceholder="Title" className="form-control"
                       required onChange={(e) => this.setState({title_ru: e.target.value})} value={this.state.title_ru} />
            </div>
            <div className="form-group">
                <label htmlFor="title">Название на казахском</label>
                <input type="text" name="title" maxLength="150"
                       id="title" pleaceholder="Title" className="form-control"
                       required onChange={(e) => this.setState({title_kk: e.target.value})} value={this.state.title_kk} />
            </div>
            <div className="form-group">
                <label htmlFor="description">Описание на русском</label>
                <input type="text" name="description" maxLength="150"
                       id="description" pleaceholder="Description" className="form-control"
                       required onChange={(e) => this.setState({desc_ru: e.target.value})} value={this.state.desc_ru}  />
            </div>
            <div className="form-group">
                <label htmlFor="description">Описание на казахском</label>
                <input type="text" name="description" maxLength="150"
                       id="description" pleaceholder="Description" className="form-control"
                       required onChange={(e) => this.setState({desc_kk: e.target.value})} value={this.state.desc_kk}  />
            </div>
            <div className="form-group form3">
              <label htmlFor="text">Содержание страницы на русском</label>
                <div className={'col-md-12'}>
                  <ReactSummernote
                    value={this.state.content}
                    options={{
                      // lang: 'ru-RU',
                      height: 350,
                      dialogsInBody: true,
                      toolbar: [
                        ['style', ['style']],
                        ['font', ['bold', 'underline', 'clear']],
                        ['fontname', ['fontname']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['table', ['table']],
                        ['insert', ['link', 'picture', 'video']],
                        ['view', ['fullscreen', 'codeview']]
                      ]
                    }}
                    onChange={this.onChange}
                  />
                </div>
            </div>
            <div className="form-group form3">
              <label htmlFor="text">Содержание страницы на казахском</label>
                <div className={'col-md-12'}>
                  <ReactSummernote
                    value={this.state.content_kk}
                    options={{
                      // lang: 'ru-RU',
                      height: 350,
                      dialogsInBody: true,
                      toolbar: [
                        ['style', ['style']],
                        ['font', ['bold', 'underline', 'clear']],
                        ['fontname', ['fontname']],
                        ['para', ['ul', 'ol', 'paragraph']],
                        ['table', ['table']],
                        ['insert', ['link', 'picture', 'video']],
                        ['view', ['fullscreen', 'codeview']]
                      ]
                    }}
                    onChange={this.onChangeKK}
                  />
                </div>
            </div>
            <input type="submit" className="btn btn-outline-success" value="Отправить статью" onClick={this.requestSubmission.bind(this)} />
          </form>
          <div>
            <hr />
            <Link className="btn btn-outline-secondary pull-right" id="back" to={'/panel/admin/addPages/'}>
              <i className="glyphicon glyphicon-chevron-left"></i>
              Назад
            </Link>
          </div>
        </div>
      </div>
    )
  }

}
