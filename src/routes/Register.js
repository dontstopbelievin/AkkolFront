import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PreloaderIcon, {ICON_TYPE} from 'react-preloader-icon';
import $ from 'jquery';
// import browseKeyStore from '../assets/js/crypto_object.js';

export default class Register extends React.Component {
  constructor() {
    super();
    this.webSocket = new WebSocket('wss://127.0.0.1:13579/');
    this.heartbeat_msg = '--heartbeat--';
    this.heartbeat_interval = null;
    this.missed_heartbeats = 0;
    this.missed_heartbeats_limit_min = 3;
    this.missed_heartbeats_limit_max = 50;
    this.missed_heartbeats_limit = this.missed_heartbeats_limit_min;
    this.callback = null;
    this.state = {
      username: "", 
      companyName: "", 
      iin: "", 
      bin: "", 
      firstName: "",
      lastName: "",
      middleName: "",
      email: "", 
      pwd: "", 
      confirmPwd: "",
      loadingVisible: false,
      isCompany: false,
      storageAlias: "PKCS12"
    }
  }

  btnChooseFile() {
    var browseKeyStore = {
      "method": "browseKeyStore",
      "args": [this.state.storageAlias, "P12", '']
    };
    this.callback = "chooseStoragePathBack";
    this.webSocketFunction();
    //TODO: CHECK CONNECTION
    this.setMissedHeartbeatsLimitToMax();
    this.webSocket.send(JSON.stringify(browseKeyStore));
  }

  btnLogin() {
    let password = $('#inpPassword').val();
    let path = $('#storagePath').val();
    let keyType = "AUTH";
    if (path !== null && path !== "" && this.state.storageAlias !== null && this.state.storageAlias !== "") {
      if (password !== null && password !== "") {
        this.getKeys(this.state.storageAlias, path, password, keyType, "loadKeysBack");
        //console.log(this.state.resultIIN);
      } else {
        alert("Введите пароль к хранилищу");
      }
    } else {
      alert("Не выбран хранилище!");
    }
  }

  //use register function
  register() {
    console.log("register function started");
    // var username = this.state.username.trim();
    var email = this.state.email.trim();
    var pwd = this.state.pwd.trim();
    var confirmPwd = this.state.confirmPwd.trim();

    var registerData = {
      user_name: this.state.username,
      company_name: this.state.companyName,
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      middle_name: this.state.middleName,
      email: this.state.email,
      password: this.state.pwd.trim(),
      confirm_password: this.state.confirmPwd.trim()
    };

    console.log(registerData);

    var data = JSON.stringify(registerData);

    if (!!email && !pwd && !confirmPwd) {
      return;
    } 
    else {
      this.setState({loadingVisible: true});
      var xhr = new XMLHttpRequest();
      xhr.open("post", window.url + "api/Account/Register", true);
      //Send the proper header information along with the request
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          alert("Вы успешно зарегистрировались!\n Можете войти через созданный аккаунт!");
          this.setState({loadingVisible: false});
        } else {
          console.log(xhr.response);
          this.setState({loadingVisible: false}); 
          //alert("Ошибка " + xhr.status + ': ' + xhr.statusText);
        }
      }.bind(this);
      //console.log(data);
      xhr.send(data);
    }
    
  }

  registerWithoutECP() {
    console.log("registerWithoutECP function started");

    var registerData = {
      company_name: this.state.companyName,
      iin: this.state.iin,
      bin: this.state.bin,
      first_name: this.state.firstName,
      last_name: this.state.lastName,
      middle_name: this.state.middleName,
      email: this.state.email,
      password: this.state.pwd.trim(),
      confirm_password: this.state.confirmPwd.trim(),
      password_confirmation: this.state.confirmPwd.trim()
    };

    console.log(registerData);

    var data = JSON.stringify(registerData);

    if (!!this.state.email && !this.state.pwd && !this.state.confirmPwd) {
      return;
    } 
    else {
      this.setState({loadingVisible: true});
      var xhr = new XMLHttpRequest();
      xhr.open("post", window.url + "api/register", true);
      //Send the proper header information along with the request
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          alert("Вы успешно зарегистрировались!\n Можете войти через созданный аккаунт!");
          this.setState({loadingVisible: false});
        } else {
          console.log(xhr.response);
          this.setState({loadingVisible: false}); 
          //alert("Ошибка " + xhr.status + ': ' + xhr.statusText);
        }
      }.bind(this);
      //console.log(data);
      xhr.send(data);
    }
  }

  webSocketFunction() {
    this.webSocket.onopen = function (event) {
      if (this.heartbeat_interval == "") {
        this.missed_heartbeats = 0;
        this.heartbeat_interval = setInterval(this.pingLayer, 2000);
      }
      console.log("Connection opened");
    }.bind(this);

    this.webSocket.onclose = function (event) {
      if (event.wasClean) {
        console.log('connection has been closed');
      } 
      else {
        console.log('Connection error');
        this.openDialog();
      }
      console.log('Code: ' + event.code + ' Reason: ' + event.reason);
    }.bind(this);

    this.webSocket.onmessage = function (event) {
      if (event.data === this.state.heartbeat_msg) {
        this.missed_heartbeats = 0;
        return;
      }

      var result = JSON.parse(event.data);

      if (result != null) {
        var rw = {
          result: result['result'],
          secondResult: result['secondResult'],
          errorCode: result['errorCode'],
          getResult: function () {
            return this.result;
          },
          getSecondResult: function () {
            return this.secondResult;
          },
          getErrorCode: function () {
            return this.errorCode;
          }
        };
        
        switch (this.callback) {
          case 'chooseStoragePathBack':
            this.chooseStoragePathBack(rw);
            break;

          case 'loadKeysBack':
            this.loadKeysBack(rw);
            break;

          case 'signXmlBack':
            this.signXmlBack(rw);
            break;
          default:
            break;
        }
      }
      //console.log(event);
      this.setMissedHeartbeatsLimitToMin();
    }.bind(this);
  }

  setMissedHeartbeatsLimitToMax() {
    this.missed_heartbeats_limit = this.missed_heartbeats_limit_max;
  }

  setMissedHeartbeatsLimitToMin() {
    this.missed_heartbeats_limit = this.missed_heartbeats_limit_min;
  }

  pingLayer() {
    //console.log("pinging...");
    try {
      this.missed_heartbeats++;
      if (this.missed_heartbeats >= this.missed_heartbeats_limit)
          throw new Error("Too many missed heartbeats.");
      this.webSocket.send(this.heartbeat_msg);
    } catch (e) {
      clearInterval(this.heartbeat_interval);
      this.heartbeat_interval = null;
      console.warn("Closing connection. Reason: " + e.message);
      this.webSocket.close();
    }
  }

  getKeys(storageName, storagePath, password, type, callBack) {
    var getKeys = {
        "method": "getKeys",
        "args": [storageName, storagePath, password, type]
    };
    this.callback = callBack;
    this.webSocketFunction();
    this.setMissedHeartbeatsLimitToMax();
    this.webSocket.send(JSON.stringify(getKeys));
  }

  getTokenXml(alias) {
    let storagePath = $('#storagePath').val();
    let password = $('#inpPassword').val();
    $.get(window.url + 'api/Account/GetTokenXml', function (tokenXml) {
        if (storagePath !== null && storagePath !== "" && this.state.storageAlias !== null && this.state.storageAlias !== "") {
          if (password !== null && password !== "") {
            if (alias !== null && alias !== "") {
              if (tokenXml !== null && tokenXml !== "") {
                // console.log(tokenXml);
                this.signXml(this.state.storageAlias, storagePath, alias, password, tokenXml, "signXmlBack");
              }
              else {
                alert("Нет данных для подписания!");
              }
            }
            else {
              alert("Вы не выбрали ключ!");
            }
          }
          else {
            alert("Введите пароль к хранилищу");
          }
        } 
        else {
          alert("Не выбран хранилище!");
        }
    }.bind(this));
  }

  signXml(storageName, storagePath, alias, password, xmlToSign, callBack) {
    // xmlToSign
    var signXml = {
        "method": "signXml",
        "args": [storageName, storagePath, alias, password, xmlToSign]
    };
    //console.log(signXml);
    this.callback = callBack;
    this.webSocketFunction();
    this.setMissedHeartbeatsLimitToMax();
    this.webSocket.send(JSON.stringify(signXml));
  }

  signXmlBack(result) {
    
    if (result['errorCode'] === "NONE") {
      let signedXml = result.result;
      var data = { XmlDoc: signedXml }
      $.ajax({
          url: window.url + 'api/Account/LoginCert',
          type: "POST",
          contentType: "application/json; charset=utf-8",
          data: JSON.stringify(data),
          success: function (response) {
             // var commonName = response.commonName;
             // var commonNameValues = commonName.split("?");
             // you will get response from your php page (what you echo or print)  
              this.setState({user_name: response.IIN});
              this.setState({firstName: response.firstName});
              this.setState({last_name: response.last_name});
              this.setState({middleName: response.middleName});
              $('#userName').val(response.IIN);
              $('#firstName').val(response.firstName);
              $('#lastName').val(response.lastName);
              $('#middleName').val(response.middleName);
              alert(response.firstName + ", ЭЦП успешно загружен! Заполните остальные поля.");
          }.bind(this),
          error: function(jqXHR, textStatus, errorThrown) {
             console.log(textStatus, errorThrown);
          }
      });

      // $.post(window.url + 'api/Account/LoginCert', {
      //     xml: signedXml
      // }, function (data) {
      //     alert('RESULT: ' + data);
      // });
    }
    else {
      if (result['errorCode'] === "WRONG_PASSWORD" && result['result'] > -1) {
          alert("Неправильный пароль! Количество оставшихся попыток: " + result['result']);
      } else if (result['errorCode'] === "WRONG_PASSWORD") {
          alert("Неправильный пароль!");
      } else {
          alert(result['errorCode']);
          console.log('ошибка');
      }
    }
  }

  loadKeysBack(result) {
    let alias = "";
    if (result && result.result) {
      let arr = result.result.split('|');
      alias = arr[3];
    } else {
      alert('Неверный ключ')
    }
    this.getTokenXml(alias);
  }

  chooseStoragePathBack(rw) {
    if (rw.getErrorCode() === "NONE") {
      var storagePath = rw.getResult();
      if (storagePath !== null && storagePath !== "") {
        $('#storagePath').val(storagePath);
      }
      else {
        $("#storagePath").val("");
      }
    } 
    else {
      $("#storagePath").val("");
    }
  }

  openDialog() {
    //if (window.confirm("Ошибка при подключений к прослойке. Убедитесь что программа запущена и нажмите ОК") === true) {
    //  window.location.reload();
    //}
    console.log('Ошибка при подключении к прослойке. Убедитесь что программа запущена и нажмите ОК');
  }

  componentWillMount() {
    //console.log("RegisterComponent will mount");
    if(sessionStorage.getItem('tokenInfo')) {
      var userRole = JSON.parse(sessionStorage.getItem('userRoles'))[0];
      this.props.history.replace('/' + userRole);
    } else {
      this.props.history.replace('/register');
    }

    this.webSocketFunction();
  }

  componentDidMount() {
    //console.log("RegisterComponent did mount");
  }

  componentWillUnmount() {
    //console.log("RegisterComponent will unmount");
  }

  render() {
    //console.log("rendering the RegisterComponent");
    return (
      <div>
        <div className="" tabIndex="-1" role="dialog" aria-labelledby="myModalLabel">
          <div className="modal-dialog" role="document">
            <div id="loading">
              {
                this.state.loadingVisible
                  ? <Loading />
                  : <div></div>
              }
            </div>
            <div className="modal-content">
              <div className="modal-header">
                <Link to="/">
                  <button type="button" className="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                  </button>
                </Link>
                <h4 className="modal-title" id="myModalLabel">Регистрация</h4>
              </div>
              <div className="modal-body">
                <ul className="nav nav-tabs">
                  <li className="nav-item"><a className="nav-link active" data-toggle="tab" href="#menu1">Регистрация без ЭЦП</a></li>
                  <li className="nav-item"><a className="nav-link" data-toggle="tab" href="#menu2">Регистрация с ЭЦП</a></li>
                </ul>

                <div className="tab-content">
                  <div id="menu1" className="tab-pane fade active show">
                    <p>&nbsp;</p>
                    <div className="isCompany">
                      <label>
                        <input type="radio" name="userType" onClick={(e) => this.setState({isCompany: false})} /> Физическое лицо
                      </label>
                      <label>
                        <input type="radio" name="userType" onClick={(e) => this.setState({isCompany: true})} /> Юридическое лицо
                      </label>
                    </div>
                    <form onSubmit={this.registerWithoutECP.bind(this)}>
                      {
                        this.state.isCompany
                          ? 
                          <div>
                            <div className="form-group">
                                <label>БИН:</label>
                                <input type="text" className="form-control" required onChange={(e) => this.setState({bin: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Название компании:</label>
                                <input type="text" className="form-control" required onChange={(e) => this.setState({companyName: e.target.value})} />
                            </div>
                          </div>
                          : 
                          <div className="form-group">
                              <label>ИИН:</label>
                              <input type="text" className="form-control" required onChange={(e) => this.setState({iin: e.target.value})} />
                          </div>
                      }
                      <div className="form-group">
                        <label>Фамилия:</label>
                        <input type="text" className="form-control" required onChange={(e) => this.setState({lastName: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Имя:</label>
                        <input type="text" className="form-control" required onChange={(e) => this.setState({firstName: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Отчество:</label>
                        <input type="text" className="form-control" onChange={(e) => this.setState({middleName: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>E-mail:</label>
                        <input type="email" className="form-control" required value={this.state.email} onChange={(e) => this.setState({email: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Пароль:</label>
                        <input type="password" className="form-control" required value={this.state.pwd} onChange={(e) => this.setState({pwd: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label>Подтвердите Пароль:</label>
                        <input type="password" className="form-control" required value={this.state.confirmPwd} onChange={(e) => this.setState({confirmPwd: e.target.value})} />
                      </div>
                      <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">Регистрация</button>
                        <Link to="/" style={{marginRight:'5px'}}>
                          <button type="button" className="btn btn-default" data-dismiss="modal">Закрыть</button>
                        </Link>
                      </div>
                    </form>
                  </div>
                  <div id="menu2" className="tab-pane fade">
                    <p>&nbsp;</p>
                    <div className="isCompany">
                      <label>
                        <input type="radio" name="userType" onClick={(e) => this.setState({isCompany: false})} /> Физическое лицо
                      </label>
                      <label>
                        <input type="radio" name="userType" onClick={(e) => this.setState({isCompany: true})} /> Юридическое лицо
                      </label>
                    </div>
                    <div className="form-group">
                      <label className="control-label">Путь к ЭЦП
                        <input className="form-control" type="text" id="storagePath" readOnly />
                      </label>
                      <button className="btn btn-secondary btn-xs" type="button" onClick={this.btnChooseFile.bind(this)}>Выбрать файл</button> 
                    </div>
                    <div className="form-group">
                      <label className="control-label">Пароль ЭЦП
                        <input className="form-control" id="inpPassword" type="password" />
                      </label>
                      <button className="btn btn-primary" id="btnLogin" onClick={this.btnLogin.bind(this)}>Загрузить ЭЦП</button>
                    </div>
                    <hr />
                    <form id="registerForm" onSubmit={this.register.bind(this)}>
                      <div className="form-group">
                        <label htmlFor="UserName" className="control-label">ИИН/БИН:</label>
                        <input type="text" className="form-control" id="userName" required disabled />
                      </div>
                      {
                        this.state.isCompany
                          ? 
                          <div className="form-group">
                              <label>Название компании:</label>
                              <input type="text" className="form-control" required onChange={(e) => this.setState({companyName: e.target.value})} />
                          </div>
                          : ""
                      }
                      <div className="form-group">
                        <label htmlFor="surname" className="control-label">Фамилия:</label>
                        <input type="text" className="form-control" id="lastName" required disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="name" className="control-label">Имя:</label>
                        <input type="text" className="form-control" id="firstName" required disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="patronymic" className="control-label">Отчество:</label>
                        <input type="text" className="form-control" id="middleName" disabled />
                      </div>
                      <div className="form-group">
                        <label htmlFor="Email" className="control-label">E-mail:</label>
                        <input type="email" className="form-control" required value={this.state.email} onChange={(e) => this.setState({email: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="Pwd" className="control-label">Пароль:</label>
                        <input type="password" className="form-control" required value={this.state.pwd} onChange={(e) => this.setState({pwd: e.target.value})} />
                      </div>
                      <div className="form-group">
                        <label htmlFor="ConfirmPwd" className="control-label">Подтвердите Пароль:</label>
                        <input type="password" className="form-control" required value={this.state.confirmPwd} onChange={(e) => this.setState({confirmPwd: e.target.value})} />
                      </div>
                      <div className="modal-footer">
                        <button type="submit" className="btn btn-primary">Регистрация</button>
                        <Link to="/" style={{marginRight:'5px'}}>
                          <button type="button" className="btn btn-default" data-dismiss="modal">Закрыть</button>
                        </Link>
                      </div>
                    </form>
                  </div>
                </div>
                
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

class Loading extends Component {
  render() {
    return (
      <PreloaderIcon type={ICON_TYPE.OVAL} size={32} strokeWidth={8} strokeColor="#135ead" duration={800} />
      )
  }
}