import React from 'react';
//import * as esriLoader from 'esri-loader';
import EsriLoaderReact from 'esri-loader-react';
//import { NavLink } from 'react-router-dom';
import { Route, NavLink, Link, Switch, Redirect } from 'react-router-dom';
import Loader from 'react-loader-spinner';

export default class ProviderPhone extends React.Component {
  render() {
    return (
      <div className="content container body-content">
        <div>
          <div>
            <Switch>
              <Route path="/panel/phone-provider/apz/status/:status/:page" exact render={(props) =>(
                <AllApzs {...props} breadCrumbs={this.props.breadCrumbs.bind(this)} />
              )} />
              <Route path="/panel/phone-provider/apz/show/:id" exact render={(props) =>(
                <ShowApz {...props} breadCrumbs={this.props.breadCrumbs.bind(this)} />
              )} />
              <Redirect from="/panel/phone-provider/apz" to="/panel/phone-provider/apz/status/active/1" />
            </Switch>
          </div>
        </div>
      </div>
    )
  }
}

class AllApzs extends React.Component {
  constructor(props) {
    super(props);

    var roles = JSON.parse(sessionStorage.getItem('userRoles'));

    this.state = {
      loaderHidden: false,
      isPerformer: (roles.indexOf('PerformerPhone') != -1),
      response: null,
      pageNumbers: []
    };

  }

  componentDidMount() {
    this.props.breadCrumbs();
    this.getApzs();
  }

  componentWillReceiveProps(nextProps) {
    this.getApzs(nextProps.match.params.status, nextProps.match.params.page);
  }

  getApzs(status = null, page = null) {
    if (!status) {
      status = this.props.match.params.status;
    }

    if (!page) {
      page = this.props.match.params.page;
    }

    this.setState({ loaderHidden: false });

    var token = sessionStorage.getItem('tokenInfo');
    var roles = JSON.parse(sessionStorage.getItem('userRoles'));

    if (roles == null) {
      sessionStorage.clear();
      alert("Token is expired, please login again!");
      this.props.history.replace("/login");
      return false;
    }

    var providerName = roles[1];
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/apz/provider/" + providerName + "/all/" + status + '?page=' + page, true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function () {
      if (xhr.status === 200) {
        var response = JSON.parse(xhr.responseText);
        var pageNumbers = [];
        var start = (response.current_page - 4) > 0 ? (response.current_page - 4) : 1;
        var end = (response.current_page + 4) < response.last_page ? (response.current_page + 4) : response.last_page;
        
        for (start; start <= end; start++) {
          pageNumbers.push(start);
        }

        this.setState({pageNumbers: pageNumbers});
        this.setState({response: response});
      }

      this.setState({ loaderHidden: true });
    }.bind(this);
    xhr.send();
  }

  toDate(date) {
    if(date === null) {
      return date;
    }

    var jDate = new Date(date);
    var curr_date = jDate.getDate() < 10 ? "0" + jDate.getDate() : jDate.getDate();
    var curr_month = (jDate.getMonth() + 1) < 10 ? "0" + (jDate.getMonth() + 1) : jDate.getMonth() + 1;
    var curr_year = jDate.getFullYear();
    var curr_hour = jDate.getHours() < 10 ? "0" + jDate.getHours() : jDate.getHours();
    var curr_minute = jDate.getMinutes() < 10 ? "0" + jDate.getMinutes() : jDate.getMinutes();
    var formated_date = curr_date + "-" + curr_month + "-" + curr_year + " " + curr_hour + ":" + curr_minute;
    
    return formated_date;
  }

  render() {
    var status = this.props.match.params.status;
    var page = this.props.match.params.page;
    var apzs = this.state.response ? this.state.response.data : [];

    return (
      <div>
        <div className="card-header">
          <h4 className="mb-0">Архитектурно-планировочное задание</h4>
        </div>
        {this.state.loaderHidden &&
          <div>
            <ul className="nav nav-tabs mb-2 pull-right">
              <li className="nav-item"><NavLink exact activeClassName="nav-link active" className="nav-link" activeStyle={{color:"black"}} isActive={(match, location) => status === 'active'} to="/panel/phone-provider/apz/status/active/1" replace>Активные</NavLink></li>
              
              {this.state.isPerformer &&
                <li className="nav-item"><NavLink exact activeClassName="nav-link active" className="nav-link" activeStyle={{color:"black"}} isActive={(match, location) => status === 'awaiting'} to="/panel/phone-provider/apz/status/awaiting/1" replace>В ожидании</NavLink></li>
              }

              <li className="nav-item"><NavLink exact activeClassName="nav-link active" className="nav-link" activeStyle={{color:"black"}} isActive={(match, location) => status === 'accepted'} to="/panel/phone-provider/apz/status/accepted/1" replace>Принятые</NavLink></li>
              <li className="nav-item"><NavLink activeClassName="nav-link active" className="nav-link" activeStyle={{color:"black"}} isActive={(match, location) => status === 'declined'} to="/panel/phone-provider/apz/status/declined/1" replace>Отказанные</NavLink></li>
            </ul>

            <table className="table">
              <thead>
                <tr>
                  <th style={{width: '23%'}}>Название</th>
                  <th style={{width: '23%'}}>Заявитель</th>
                  <th style={{width: '20%'}}>Адрес</th>
                  <th style={{width: '20%'}}>Дата заявления</th>
                  
                  {(status === 'active' || status === 'awaiting') &&
                    <th style={{width: '14%'}}>Срок</th>
                  }
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {apzs.map(function(apz, index) {
                  return(
                    <tr key={index}>
                      <td>
                        {apz.project_name} 

                        {apz.object_type &&
                          <span className="ml-1">({apz.object_type})</span>
                        }
                      </td>
                      <td>{apz.applicant}</td>
                      <td>{apz.project_address}</td>
                      <td>{this.toDate(apz.created_at)}</td>
                      
                      {(status === 'active' || status === 'awaiting') &&
                        <td>
                          {apz.term > 1 ?
                            apz.term === 3 ? '2 д. (начиная со следующего дня)' : apz.term - 1 + ' д.'
                            :
                            apz.term === 1 ? 'Последний день (до 16:00)' : 'Просрочено' 
                          }
                        </td>
                      }
                      <td>
                        <Link className="btn btn-outline-info" to={'/panel/phone-provider/apz/show/' + apz.id}><i className="glyphicon glyphicon-eye-open mr-2"></i> Просмотр</Link>
                      </td>
                    </tr>
                    );
                  }.bind(this))
                }
              </tbody>
            </table>

            {this.state.response && this.state.response.last_page > 1 &&
              <nav className="pagination_block">
                <ul className="pagination justify-content-center">
                  <li className="page-item">
                    <Link className="page-link" to={'/panel/phone-provider/apz/status/' + status + '/1'}>В начало</Link>
                  </li>

                  {this.state.pageNumbers.map(function(num, index) {
                    return(
                      <li key={index} className={'page-item ' + (page == num ? 'active' : '')}>
                        <Link className="page-link" to={'/panel/phone-provider/apz/status/' + status + '/' + num}>{num}</Link>
                      </li>
                      );
                    }.bind(this))
                  }
                  <li className="page-item">
                    <Link className="page-link" to={'/panel/phone-provider/apz/status/' + status + '/' + this.state.response.last_page}>В конец</Link>
                  </li>
                </ul>
              </nav>
            }
          </div>
        }

        {!this.state.loaderHidden &&
          <div style={{textAlign: 'center'}}>
            <Loader type="Oval" color="#46B3F2" height="200" width="200" />
          </div>
        }
      </div>
    )
  }
}

class ShowApz extends React.Component {
  constructor(props) {
    super(props);

    this.webSocket = new WebSocket('wss://127.0.0.1:13579/');
    this.heartbeat_msg = '--heartbeat--';
    this.heartbeat_interval = null;
    this.missed_heartbeats = 0;
    this.missed_heartbeats_limit_min = 3;
    this.missed_heartbeats_limit_max = 50;
    this.missed_heartbeats_limit = this.missed_heartbeats_limit_min;
    this.callback = null;

    var roles = JSON.parse(sessionStorage.getItem('userRoles'));

    this.state = {
      apz: [],
      showMap: false,
      showButtons: false,
      showSignButtons: false,
      showTechCon: false,
      file: false,
      responseServiceNum: "",
      responseCapacity: "",
      responseSewage: "",
      responseClientWishes: "",
      docNumber: "",
      description: '',
      responseId: 0,
      response: false,
      responseFile: null,
      personalIdFile: false,
      confirmedTaskFile: false,
      titleDocumentFile: false,
      paymentPhotoFile: false,
      showMapText: 'Показать карту',
      accept: 'accept',
      callSaveFromSend: false,
      phoneStatus: 2,
      storageAlias: "PKCS12",
      xmlFile: false,
      isSigned: false,
      isPerformer: (roles.indexOf('PerformerPhone') != -1),
      isHead: (roles.indexOf('HeadPhone') != -1),
      isDirector: (roles.indexOf('DirectorPhone') != -1),
      heads_responses: [],
      head_accepted: true,
      headComment: "",
      customTcFile: null
    };

    this.onResponseServiceNumChange = this.onResponseServiceNumChange.bind(this);
    this.onResponseCapacityChange = this.onResponseCapacityChange.bind(this);
    this.onResponseSewageChange = this.onResponseSewageChange.bind(this);
    this.onDocNumberChange = this.onDocNumberChange.bind(this);
    this.onResponseClientWishesChange = this.onResponseClientWishesChange.bind(this);
    this.onDescriptionChange = this.onDescriptionChange.bind(this);
    this.onFileChange = this.onFileChange.bind(this);
    this.saveResponseForm = this.saveResponseForm.bind(this);
    this.sendPhoneResponse = this.sendPhoneResponse.bind(this);
    this.onHeadCommentChange = this.onHeadCommentChange.bind(this);
    this.onCustomTcFileChange = this.onCustomTcFileChange.bind(this);
  }
  componentDidMount() {
    this.props.breadCrumbs();
  }

  onResponseServiceNumChange(e) {
    this.setState({ responseServiceNum: e.target.value });
  }

  onResponseCapacityChange(e) {
    this.setState({ responseCapacity: e.target.value });
  }

  onResponseSewageChange(e) {
    this.setState({ responseSewage: e.target.value });
  }

  onResponseClientWishesChange(e) {
    this.setState({ responseClientWishes: e.target.value });
  }

  onDocNumberChange(e) {
    this.setState({ docNumber: e.target.value });
  }

  onDescriptionChange(e) {
    this.setState({ description: e.target.value });
  }

  onHeadCommentChange(e) {
    this.setState({ headComment: e.target.value });
  }

  onFileChange(e) {
    this.setState({ file: e.target.files[0] });
  }

  onCustomTcFileChange(e) {
    this.setState({ customTcFile: e.target.files[0] });
  }

  // this function to show one of the forms Accept/Decline
  toggleAcceptDecline(value) {
    this.setState({accept: value});
  }

  componentWillMount() {
    this.getApzInfo();
  }

  getApzInfo() {
    var id = this.props.match.params.id;
    var roles = JSON.parse(sessionStorage.getItem('userRoles'));
    var userId = JSON.parse(sessionStorage.getItem('userId'));

    if (roles == null) {
        sessionStorage.clear();
        alert("Время сессии истекло. Пожалуйста войдите заново!");
        this.props.history.replace("/login");
        return false;
    }

    var providerName = roles[1];
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/apz/provider/" + providerName + "/" + id, true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        //console.log(data);
        this.setState({apz: data});
        this.setState({showButtons: false});
        this.setState({showTechCon: false});
        this.setState({personalIdFile: data.files.filter(function(obj) { return obj.category_id === 3 })[0]});
        this.setState({confirmedTaskFile: data.files.filter(function(obj) { return obj.category_id === 9 })[0]});
        this.setState({titleDocumentFile: data.files.filter(function(obj) { return obj.category_id === 10 })[0]});
        this.setState({paymentPhotoFile: data.files.filter(function(obj) { return obj.category_id === 20 })[0]});

        if (data.commission.apz_phone_response) {
          data.commission.apz_phone_response.response_text ? this.setState({description: data.commission.apz_phone_response.response_text}) : this.setState({description: ""});
          data.commission.apz_phone_response.service_num ? this.setState({responseServiceNum: data.commission.apz_phone_response.service_num}) : this.setState({responseServiceNum: ""});
          data.commission.apz_phone_response.capacity ? this.setState({responseCapacity: data.commission.apz_phone_response.capacity}) : this.setState({responseCapacity: ""});
          data.commission.apz_phone_response.sewage ? this.setState({responseSewage: data.commission.apz_phone_response.sewage}) : this.setState({responseSewage: ""});
          data.commission.apz_phone_response.client_wishes ? this.setState({responseClientWishes: data.commission.apz_phone_response.client_wishes}) : this.setState({responseClientWishes: ""});
          data.commission.apz_phone_response.doc_number ? this.setState({docNumber: data.commission.apz_phone_response.doc_number}) : this.setState({docNumber: ""});
          data.commission.apz_phone_response.id ? this.setState({responseId: data.commission.apz_phone_response.id}) : this.setState({responseId: ""});
          data.commission.apz_phone_response.response ? this.setState({response: data.commission.apz_phone_response.response}) : this.setState({response: ""});
          data.commission.apz_phone_response.files ? this.setState({customTcFile: data.commission.apz_phone_response.files.filter(function(obj) { return obj.category_id === 23})[0]}) : this.setState({customTcFile: null});;

          if(data.PhoneResponseId !== -1){
            this.setState({accept: this.state.customTcFile ? 'answer' : data.commission.apz_phone_response.response ? 'accept' : 'decline'});
          }

          this.setState({responseFile: data.commission.apz_phone_response.files.filter(function(obj) { return obj.category_id === 11 || obj.category_id === 12})[0]});
          this.setState({xmlFile: data.commission.apz_phone_response.files.filter(function(obj) { return obj.category_id === 17})[0]});
        }

        this.setState({phoneStatus: data.apz_phone.status});

        if (data.status_id === 5 && data.apz_phone.status === 2) { 
          this.setState({showButtons: true}); 
        }

        if(data.apz_phone.status === 1){
          this.setState({showTechCon: true});
        }

        if (this.state.xmlFile) {
          this.setState({isSigned: true});
        }

        this.setState({heads_responses: data.apz_provider_head_response.filter(function(obj) { return obj.role_id === 36 })});

        if (this.state.isHead && data.apz_provider_head_response.filter(function(obj) { return obj.role_id === 36 && obj.user_id === userId }).length === 0) {
          this.setState({head_accepted: false});
        }
      }
    }.bind(this)
    xhr.send();
  }

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
              setTimeout(function() {window.URL.revokeObjectURL(url);},1000);
            };

          }());

          saveByteArray([base64ToArrayBuffer(data.file)], data.file_name);
        } else {
          alert('Не удалось скачать файл');
        }
      }
    xhr.send();
  }

  setMissedHeartbeatsLimitToMax() {
    this.missed_heartbeats_limit = this.missed_heartbeats_limit_max;
  }

  setMissedHeartbeatsLimitToMin() {
    this.missed_heartbeats_limit = this.missed_heartbeats_limit_min;
  }

  browseKeyStore(storageName, fileExtension, currentDirectory, callBack) {
    var browseKeyStore = {
      "method": "browseKeyStore",
      "args": [storageName, fileExtension, currentDirectory]
    };
    this.callback = callBack;
    this.webSocketFunction();
    this.setMissedHeartbeatsLimitToMax();
    this.webSocket.send(JSON.stringify(browseKeyStore));
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

  chooseFile() {
    var browseKeyStore = {
      "method": "browseKeyStore",
      "args": [this.state.storageAlias, "P12", '']
    };
    this.callback = "chooseStoragePathBack";
    this.webSocketFunction();
    this.setMissedHeartbeatsLimitToMax();
    this.webSocket.send(JSON.stringify(browseKeyStore));
  }

  signMessage() {
    let password = document.getElementById("inpPassword").value;
    let path = document.getElementById("storagePath").value;
    let keyType = "SIGN";
    if (path !== null && path !== "" && this.state.storageAlias !== null && this.state.storageAlias !== "") {
      if (password !== null && password !== "") {
        this.getKeys(this.state.storageAlias, path, password, keyType, "loadKeysBack");
      } else {
        alert("Введите пароль к хранилищу");
      }
    } else {
      alert("Не выбран хранилище!");
    }
  }

  loadKeysBack(result) {
    if (result.errorCode === "WRONG_PASSWORD") {
      alert("Неверный пароль!");
      return false;
    }

    let alias = "";
    if (result && result.result) {
      let keys = result.result.split('/n');
      if (keys && keys.length > 0) {
        let arr = keys[0].split('|');
        alias = arr[3];
        this.getTokenXml(alias);
      }
    }
    if (!alias) {
      alert('Нет ключа подписания');
    }
  }

  getTokenXml(alias) {
    let password = document.getElementById("inpPassword").value;
    let storagePath = document.getElementById("storagePath").value;
    var token = sessionStorage.getItem('tokenInfo');

    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + 'api/apz/provider/get_xml/phone/' + this.state.apz.id, true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function() {
      var tokenXml = xhr.responseText;

      if (storagePath !== null && storagePath !== "" && this.state.storageAlias !== null && this.state.storageAlias !== "") {
        if (password !== null && password !== "") {
          if (alias !== null && alias !== "") {
            if (tokenXml !== null && tokenXml !== "") {
                this.signXml(this.state.storageAlias, storagePath, alias, password, tokenXml, "signXmlBack");
            }
            else {
                alert("Нет данных для подписания!");
            }
          } else {
              alert("Вы не выбрали ключ!");
          }
        } else {
            alert("Введите пароль к хранилищу");
        }
      } else {
          alert("Не выбран хранилище!");
      }
    }.bind(this);
    xhr.send();
  }

  signXml(storageName, storagePath, alias, password, xmlToSign, callBack) {
    var signXml = {
      "method": "signXml",
      "args": [storageName, storagePath, alias, password, xmlToSign]
    };
    this.callback = callBack;
    this.webSocketFunction();
    this.setMissedHeartbeatsLimitToMax();
    this.webSocket.send(JSON.stringify(signXml));
  }

  signXmlBack(result) {
    if (result['errorCode'] === "NONE") {
      let signedXml = result.result;
      var token = sessionStorage.getItem('tokenInfo');
      var data = {xml: signedXml}

      console.log("SIGNED XML ------> \n", signedXml);

      var xhr = new XMLHttpRequest();
      xhr.open("post", window.url + 'api/apz/provider/save_xml/phone/' + this.state.apz.id, true);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function() {
        if (xhr.status === 200) {
          this.setState({ isSigned: true });
        } else if (xhr.status === 403 && JSON.parse(xhr.responseText).message) {
          alert(JSON.parse(xhr.responseText).message);
        } else {
          alert("Не удалось подписать файл");
        }
      }.bind(this);
      xhr.send(JSON.stringify(data));
    }
    else {
      if (result['errorCode'] === "WRONG_PASSWORD" && result['result'] > -1) {
        alert("Неправильный пароль! Количество оставшихся попыток: " + result['result']);
      } else if (result['errorCode'] === "WRONG_PASSWORD") {
        alert("Неправильный пароль!");
      } else {
        alert(result['errorCode']);
      }
    }
  }

  chooseStorage(storage) {
    this.browseKeyStore(storage, "P12", '', "chooseStoragePathBack");
  }

  chooseStoragePathBack(rw) {
    if (rw.getErrorCode() === "NONE") {
      var storagePath = rw.getResult();
      if (storagePath !== null && storagePath !== "") {
        document.getElementById("storagePath").value = storagePath;
      }
      else {
        document.getElementById("storagePath").value = "";
      }
    } else {
      document.getElementById("storagePath").value = "";
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
      if (event.data === this.heartbeat_msg) {
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

  openDialog() {
    if (window.confirm("Ошибка при подключений к прослойке. Убедитесь что программа запущена и нажмите ОК") === true) {
      window.location.reload();
    }
  }

  // this function is to save the respones form when any change is made
  saveResponseForm(apzId, status, comment){
    var token = sessionStorage.getItem('tokenInfo');
    var file = this.state.file;
    var customTcFile = this.state.customTcFile;

    var formData = new FormData();
    formData.append('file', file);
    formData.append('customTcFile', customTcFile);
    formData.append('Response', status);
    formData.append('Message', comment);
    if(status === false){
      formData.append('ResponseServiceNum', "");
      formData.append('ResponseCapacity', "");
      formData.append('ResponseSewage', "");
      formData.append('ResponseClientWishes', "");
    }
    else{
      formData.append('ResponseServiceNum', this.state.responseServiceNum);
      formData.append('ResponseCapacity', this.state.responseCapacity);
      formData.append('ResponseSewage', this.state.responseSewage);
      formData.append('ResponseClientWishes', this.state.responseClientWishes);
    }
    formData.append('DocNumber', this.state.docNumber);

    var xhr = new XMLHttpRequest();
    xhr.open("post", window.url + "api/apz/provider/phone/" + apzId + '/save', true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.onload = function () {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        //console.log(data);
        this.setState({responseId: data.id});
        data.response ? this.setState({response: data.response}) : this.setState({response: ""});
        data.files ? this.setState({customTcFile: data.files.filter(function(obj) { return obj.category_id === 23})[0]}) : this.setState({customTcFile: null});
        data.response ? this.setState({accept: this.state.customTcFile ? 'answer' : data.response ? 'accept' : 'decline'}) : this.setState({accept: "accept"});
        data.response_text ? this.setState({description: data.response_text}) : this.setState({description: ""});
        data.files ? this.setState({responseFile: data.files.filter(function(obj) { return obj.category_id === 11 || obj.category_id === 12 })[0]}) : this.setState({responseFile: null});
        data.service_num ? this.setState({responseServiceNum: data.service_num}) : this.setState({responseServiceNum: ""});
        data.capacity ? this.setState({responseCapacity: data.capacity}) : this.setState({responseCapacity: ""});
        data.sewage ? this.setState({responseSewage: data.sewage}) : this.setState({responseSewage: ""});
        data.client_wishes ? this.setState({responseClientWishes: data.client_wishes}) : this.setState({responseClientWishes: ""});
        
        if (this.state.callSaveFromSend) {
          this.setState({callSaveFromSend: false});
          this.sendPhoneResponse(apzId, status, comment);
        } else {
          alert("Ответ сохранен!");

          this.setState({showSignButtons: true})
        }
      } else if (xhr.status === 401) {
        sessionStorage.clear();
        alert("Время сессии истекло. Пожалуйста войдите заново!");
        this.props.history.replace("/login");
      }
    }.bind(this);
    xhr.send(formData);
  }

  // this function is to send the final response
  sendPhoneResponse(apzId, status, comment) {
    if(this.state.responseId <= 0 || this.state.responseId > 0 && this.state.response != status){
      this.setState({callSaveFromSend: true});
      this.saveResponseForm(apzId, status, comment);
    }
    else{
      var token = sessionStorage.getItem('tokenInfo');
      var xhr = new XMLHttpRequest();
      xhr.open("post", window.url + "api/apz/provider/phone/" + apzId + '/update', true);
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.onload = function () {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);

          if(data.response === 1) {
            alert("Заявление принято!");
            this.setState({ showButtons: false });
            this.setState({ phoneStatus: 1 });
            this.setState({showTechCon: true});
          } 
          else if(data.response === 0) {
            alert("Заявление отклонено!");
            this.setState({ showButtons: false });
            this.setState({ phoneStatus: 0 })
          }
        } else if (xhr.status === 401) {
          sessionStorage.clear();
          alert("Время сессии истекло. Пожалуйста войдите заново!");
          this.props.history.replace("/login");
        } else if (xhr.status === 403 && JSON.parse(xhr.responseText).message) {
          alert(JSON.parse(xhr.responseText).message);
        }
      }.bind(this);
      xhr.send(JSON.stringify({docNumber: this.state.docNumber}));
    } 
  }

  sendHeadResponse(apzId, status, comment) {
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();

    var formData = new FormData();
    formData.append('status', status);
    formData.append('comment', comment);

    if (!comment) {
      alert('Заполните поле "Комментарий"');
      return false;
    }

    xhr.open("post", window.url + "api/apz/provider/headphone/" + apzId + '/response', true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.onload = function () {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);
        alert('Ответ успешно отправлен');
        this.setState({head_accepted: true});
        this.setState({heads_responses: data.head_responses});
      } else if (xhr.status === 401) {
        sessionStorage.clear();
        alert("Время сессии истекло. Пожалуйста войдите заново!");
        this.props.history.replace("/login");
      } else if (xhr.status === 403 && JSON.parse(xhr.responseText).message) {
        alert(JSON.parse(xhr.responseText).message);
      }
    }.bind(this);
    xhr.send(formData);
  }

  // print technical condition
  printTechCon(apzId, project) {
    var token = sessionStorage.getItem('tokenInfo');
    if (token) {
      var xhr = new XMLHttpRequest();
      xhr.open("get", window.url + "api/print/tc/phone/" + apzId, true);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.onload = function () {
        if (xhr.status === 200) {
          //test of IE
          if (typeof window.navigator.msSaveBlob === "function") {
            window.navigator.msSaveBlob(xhr.response, "tc-" + new Date().getTime() + ".pdf");
          } else {
            var data = JSON.parse(xhr.responseText);
            var today = new Date();
            var curr_date = today.getDate();
            var curr_month = today.getMonth() + 1;
            var curr_year = today.getFullYear();
            var formated_date = "(" + curr_date + "-" + curr_month + "-" + curr_year + ")";

            var base64ToArrayBuffer = (function () {
        
              return function (base64) {
                var binaryString =  window.atob(base64);
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

            saveByteArray([base64ToArrayBuffer(data.file)], "ТУ-Телефон-" + project + formated_date + ".pdf");
          }
        } else {
          alert('Не удалось скачать файл');
        }
      }
      xhr.send();
    } else {
      console.log('Время сессии истекло.');
    }
  }

  toggleMap(value) {
    this.setState({
      showMap: value
    })

    if (value) {
      this.setState({
        showMapText: 'Скрыть карту'
      })
    } else {
      this.setState({
        showMapText: 'Показать карту'
      })
    }
  }

  toDate(date) {
    if(date === null) {
      return date;
    }
    
    var jDate = new Date(date);
    var curr_date = jDate.getDate();
    var curr_month = jDate.getMonth() + 1;
    var curr_year = jDate.getFullYear();
    var curr_hour = jDate.getHours();
    var curr_minute = jDate.getMinutes() < 10 ? "0" + jDate.getMinutes() : jDate.getMinutes();
    var formated_date = curr_date + "-" + curr_month + "-" + curr_year + " " + curr_hour + ":" + curr_minute;
    
    return formated_date;
  }
  
printData()
{
   var divToPrint=document.getElementById("printTable");
   var divToPrints=document.getElementById("detail_table");
   var newWin= window.open("");
   newWin.document.write(divToPrint.outerHTML + divToPrints.outerHTML);
    var elements = newWin.document.getElementsByClassName('shukichi');
    while(elements.length > 0){
        elements[0].parentNode.removeChild(elements[0]);
    }
   newWin.print();
   newWin.close();
}

  render() {
    var apz = this.state.apz;

    if (apz.length === 0) {
      return false;
    }

    return (
      <div className="row">
        <div className="col-sm-6">
          <h5 className="block-title-2 mt-3 mb-3">Общая информация</h5>
          
          <table className="table table-bordered table-striped"  id="printTable">
            <tbody>
              <tr>
                <td style={{width: '40%'}}><b>ИД заявки</b></td>
                <td>{apz.id}</td>
              </tr>
              <tr>
                <td><b>Заявитель</b></td>
                <td>{apz.applicant}</td>
              </tr>
              <tr>
                <td><b>Телефон</b></td>
                <td>{apz.phone}</td>
              </tr>
              <tr>
                <td><b>Заказчик</b></td>
                <td>{apz.customer}</td>
              </tr>
              <tr>
                <td><b>Разработчик</b></td>
                <td>{apz.designer}</td>
              </tr>
              <tr>
                <td><b>Название проекта</b></td>
                <td>{apz.project_name}</td>
              </tr>
              <tr>
                <td><b>Адрес проектируемого объекта</b></td>
                <td>
                  {apz.project_address}

                  {apz.project_address_coordinates &&
                    <a className="ml-2 pointer text-info" onClick={this.toggleMap.bind(this, true)}>Показать на карте</a>
                  }
                </td>
              </tr>
              <tr>
                <td><b>Дата заявления</b></td>
                <td>{apz.created_at && this.toDate(apz.created_at)}</td>
              </tr>
              
              {this.state.personalIdFile &&
                <tr className="shukichi">
                  <td><b>Уд. лич./ Реквизиты</b></td>
                  <td><a className="text-info pointer" onClick={this.downloadFile.bind(this, this.state.personalIdFile.id)}>Скачать</a></td>
                </tr>
              }

              {this.state.confirmedTaskFile &&
                <tr className="shukichi">
                  <td><b>Утвержденное задание</b></td>
                  <td><a className="text-info pointer" onClick={this.downloadFile.bind(this, this.state.confirmedTaskFile.id)}>Скачать</a></td>
                </tr>
              }

              {this.state.titleDocumentFile &&
                <tr className="shukichi">
                  <td><b>Правоустанавл. документ</b></td>
                  <td><a className="text-info pointer" onClick={this.downloadFile.bind(this, this.state.titleDocumentFile.id)}>Скачать</a></td>
                </tr>
              }
              {this.state.paymentPhotoFile &&
                <tr className="shukichi">
                  <td><b>Сканированный файл оплаты</b></td>
                  <td><a className="text-info pointer" onClick={this.downloadFile.bind(this, this.state.paymentPhotoFile.id)}>Скачать</a></td>
                </tr>
              }
            </tbody>
          </table>
        </div>

        <div className="col-sm-6">
          <h5 className="block-title-2 mt-3 mb-3">Детали</h5>

          <table className="table table-bordered table-striped"  id="detail_table">
            <tbody>
              <tr>
                <td style={{width: '40%'}}>Количество ОТА и услуг в разбивке физ.лиц и юр.лиц</td> 
                <td>{apz.apz_phone.service_num}</td>
              </tr>
              <tr>
                <td>Телефонная емкость</td>
                <td>{apz.apz_phone.capacity}</td>
              </tr>
              <tr>
                <td>Планируемая телефонная канализация</td>
                <td>{apz.apz_phone.sewage}</td>
              </tr>
              <tr>
                <td>Пожелания заказчика (тип оборудования, тип кабеля и др.)</td>
                <td>{apz.apz_phone.client_wishes}</td>
              </tr>
            </tbody>
          </table>
          <button className="btn btn-raised btn-success" onClick={this.printData}>Печать</button>
        </div>

        <div className="col-sm-12">
          <div className="row provider_answer_top" style={{margin: '16px 0 0'}}>
            {(this.state.isPerformer === true || this.state.responseId != 0) &&
              <div className="col-sm-6">
                <h5 className="block-title-2 mt-3 mb-3" style={{display: 'inline'}}>Ответ</h5> 
              </div>
            }
            <div className="col-sm-6 pr-0">
              {this.state.showButtons && !this.state.isSigned && this.state.isPerformer &&
                <div className="btn-group" style={{float: 'right', margin: '0'}}>
                  <button className={'btn btn-raised ' + (this.state.accept === 'accept' ? 'btn-success' : 'btn-secondary')} style={{marginRight: '5px'}} onClick={this.toggleAcceptDecline.bind(this, 'accept')}>
                    Одобрить
                  </button>
                  <button className={'btn btn-raised ' + (this.state.accept === 'answer' ? 'btn-success' : 'btn-secondary')} style={{marginRight: '5px'}} onClick={this.toggleAcceptDecline.bind(this, 'answer')}>
                    Ответ
                  </button>
                  <button className={'btn btn-raised ' + (this.state.accept === 'decline' ? 'btn-danger' : 'btn-secondary')} onClick={this.toggleAcceptDecline.bind(this, 'decline')}>
                    Отклонить
                  </button>
                </div>
              }
            </div>
          </div>

          {this.state.accept === 'accept' && this.state.phoneStatus === 2 && !this.state.xmlFile && !this.state.isSigned && this.state.isPerformer &&
            <form className="provider_answer_body" style={{border: 'solid 1px #46A149', padding: '20px'}}>
              <div className="row pt-0">
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="responseServiceNum">Количество ОТА и услуг в разбивке физ.лиц и юр.лиц</label>
                    <input type="number" step="any" className="form-control" id="responseServiceNum" placeholder="" value={this.state.responseServiceNum} onChange={this.onResponseServiceNumChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="responseCapacity">Телефонная емкость</label>
                    <input type="number" step="any" className="form-control" id="responseCapacity" placeholder="" value={this.state.responseCapacity} onChange={this.onResponseCapacityChange} />
                  </div>
                  <div className="form-group">
                    <label htmlFor="responseSewage">Планируемая телефонная канализация</label>
                    <input type="number" step="any" className="form-control" id="responseSewage" placeholder="" value={this.state.responseSewage} onChange={this.onResponseSewageChange} />
                  </div>
                  <div className="form-group">
                    <label>Номер документа</label>
                    <input type="text" className="form-control" placeholder="" value={this.state.docNumber} onChange={this.onDocNumberChange} />
                  </div>
                </div>
                <div className="col-sm-6">
                  <div className="form-group">
                    <label htmlFor="responseClientWishes">Пожелания заказчика (тип оборудования, тип кабеля и др.)</label>
                    <textarea rows="5" id="responseClientWishes" className="form-control" value={this.state.responseClientWishes} onChange={this.onResponseClientWishesChange}></textarea>
                  </div>
                  
                  {(this.state.response === true && this.state.responseFile) &&
                    <div className="form-group">
                      <label style={{display: 'block'}}>Прикрепленный файл</label>
                      <a className="pointer text-info" title="Скачать" onClick={this.downloadFile.bind(this, this.state.responseFile.id)}>
                        Скачать 
                      </a>
                    </div>
                  }
                  <div className="form-group">
                    <label htmlFor="upload_file">Прикрепить файл</label>
                    <input type="file" id="upload_file" className="form-control" onChange={this.onFileChange} />
                  </div>
                </div>
                <div className="col-sm-12">
                  {!this.state.xmlFile &&
                    <div className="form-group">
                      <button type="button" style={{ marginRight: '5px' }} className="btn btn-secondary" onClick={this.saveResponseForm.bind(this, apz.id, "accept", "")}>
                        Сохранить
                      </button>

                      <button type="button" style={{ marginRight: '5px' }} className="btn btn-secondary" onClick={this.sendPhoneResponse.bind(this, apz.id, true, "")}>
                        Отправить без ЭЦП
                      </button>

                      {this.state.response &&
                        <button type="button" className="btn btn-secondary" onClick={this.printTechCon.bind(this, apz.id, apz.project_name)}>
                          Предварительный просмотр
                        </button>
                      }
                    </div>
                  }
                </div>
              </div>
            </form>
          }

          {this.state.accept === 'accept' && this.state.responseId != 0 && (this.state.phoneStatus === 1 || this.state.isSigned || this.state.isHead || this.state.isDirector) &&
            <div>
              <table className="table table-bordered table-striped">
                <tbody>
                  <tr>
                    <td style={{width: '40%'}}>Количество ОТА и услуг в разбивке физ.лиц и юр.лиц</td> 
                    <td>{this.state.responseServiceNum}</td>
                  </tr>
                  <tr>
                    <td>Телефонная емкость</td> 
                    <td>{this.state.responseCapacity}</td>
                  </tr> 
                  <tr>
                    <td>Планируемая телефонная канализация</td>
                    <td>{this.state.responseSewage}</td>
                  </tr>
                  <tr>
                    <td>Пожелания заказчика (тип оборудования, тип кабеля и др.)</td>
                    <td>{this.state.responseClientWishes}</td>
                  </tr>
                  <tr>
                    <td>Номер документа</td>
                    <td>{this.state.docNumber}</td>
                  </tr>
                  {this.state.titleDocumentFile &&
                    <tr>
                      <td>Прикрепленный файл</td>
                      <td>
                        <a className="pointer text-info" title="Скачать" onClick={this.downloadFile.bind(this, this.state.titleDocumentFile.id)}>
                          Скачать 
                        </a>
                      </td>
                    </tr>
                  }

                  {this.state.showTechCon === false && (this.state.isDirector || this.state.isHead) &&
                    <tr>
                      <td>Ответ в PDF</td>
                      <td>
                        <a className="pointer text-info" onClick={this.printTechCon.bind(this, apz.id, apz.project_name)}>
                          Скачать
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          {this.state.accept === 'answer' && this.state.phoneStatus === 2 && !this.state.xmlFile && !this.state.isSigned && this.state.isPerformer &&
            <div className="provider_answer_body" style={{border: 'solid 1px #46A149', padding: '20px'}}>
              <div className="form-group">
                <label htmlFor="custom_tc_file">
                  Прикрепить файл
                  
                  {this.state.customTcFile &&
                    <span style={{paddingLeft: '5px'}}>
                      (текущий файл: <a className="pointer text-info" title="Скачать" onClick={this.downloadFile.bind(this, this.state.customTcFile.id)}>{this.state.customTcFile.name}</a>)
                    </span>
                  }
                </label>
                <input type="file" id="custom_tc_file" className="form-control" onChange={this.onCustomTcFileChange} />
              </div>

              {!this.state.xmlFile &&
                <div className="form-group">
                  <button type="button" className="btn btn-secondary" onClick={this.sendPhoneResponse.bind(this, apz.id, true, "")}>
                    Отправить
                  </button>
                </div>
              }
            </div>
          }

          {this.state.accept === 'answer' && this.state.responseId != 0 && (this.state.phoneStatus === 1 || this.state.isSigned || this.state.isHead || this.state.isDirector) &&
            <table className="table table-bordered table-striped">
              <tbody>
                <tr>
                  <td>Технические условия</td> 
                  <td><a className="pointer text-info" title="Скачать" onClick={this.downloadFile.bind(this, this.state.customTcFile.id)}>Скачать</a></td>
                </tr>
              </tbody>
            </table>
          }

          {this.state.accept === 'decline' && this.state.phoneStatus === 2 && !this.state.xmlFile && !this.state.isSigned && this.state.isPerformer &&
            <form className="provider_answer_body" style={{border: 'solid 1px #f44336', padding: '20px'}}>
              <div className="form-group">
                <label>Номер документа</label>
                <input type="text" className="form-control" placeholder="" value={this.state.docNumber} onChange={this.onDocNumberChange} />
              </div>
              <div className="form-group">
               <label>Причина отклонения</label>
                <textarea rows="5" className="form-control" value={this.state.description} onChange={this.onDescriptionChange} placeholder="Описание"></textarea>
              </div>
              {(this.state.response === false && this.state.responseFile) &&
                <div className="form-group">
                  <label style={{display: 'block'}}>Прикрепленный файл</label>
                  <a className="pointer text-info" title="Скачать" onClick={this.downloadFile.bind(this, this.state.responseFile.id)}>
                    Скачать 
                  </a>
                </div>
              }
              <div className="form-group">
                <label htmlFor="upload_file">Прикрепить файл</label>
                <input type="file" id="upload_file" className="form-control" onChange={this.onFileChange} />
              </div>
              <div className="form-group">
                <button type="button" className="btn btn-secondary" onClick={this.saveResponseForm.bind(this, apz.id, 'decline', this.state.description)}>
                  Вернуть архитектору
                </button>
              </div>
            </form>
          }

          {this.state.accept === 'decline' && this.state.responseId != 0 && (this.state.phoneStatus === 0 || this.state.isSigned || this.state.isHead || this.state.isDirector) &&
            <div>
              <table className="table table-bordered table-striped">
                <tbody>
                  <tr>
                    <td style={{width: '40%'}}>Причина отклонения</td> 
                    <td>{this.state.description}</td>
                  </tr>
                  <tr>
                    <td>Номер документа</td>
                    <td>{this.state.docNumber}</td>
                  </tr>
                  {this.state.responseFile &&
                    <tr>
                      <td>Прикрепленный файл</td>
                      <td>
                        <a className="pointer text-info" title="Скачать" onClick={this.downloadFile.bind(this, this.state.responseFile.id)}>
                          Скачать 
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          }

          {this.state.phoneStatus === 2 && this.state.isSigned && this.state.isPerformer &&
            <div style={{margin: 'auto', marginTop: '20px', display: 'table', width: '30%'}}>
              <div className="form-group">
                <label>Номер документа</label>
                <input type="text" className="form-control" placeholder="" value={this.state.docNumber} onChange={this.onDocNumberChange} />
              </div>
              <div className="form-group">
                <button type="button" className="btn btn-primary" onClick={this.sendPhoneResponse.bind(this, apz.id, (this.state.response), "")}>
                  Отправить
                </button>
              </div>
            </div>
          }

          {this.state.isDirector &&
            <div>
              {!this.state.xmlFile && !this.state.isSigned && apz.status_id === 5 &&
                <div style={{margin: 'auto', marginTop: '20px', display: 'table'}}>
                  <div>Выберите хранилище</div>
                            
                  <div className="btn-group mb-2" role="group" style={{margin: 'auto', display: 'table'}}>
                    <button className="btn btn-raised" style={{marginRight: '5px'}} onClick={this.chooseFile.bind(this)}>файловое хранилище</button>
                    <button className="btn btn-raised" onClick={this.chooseStorage.bind(this, 'AKKaztokenStore')}>eToken</button>
                  </div>

                  <div className="form-group">
                    <input className="form-control" placeholder="Путь к ключу" type="hidden" id="storagePath" />
                    <input className="form-control" placeholder="Пароль" id="inpPassword" type="password" />
                  </div>

                  <div className="form-group">
                    <button className="btn btn-secondary" type="button" onClick={this.signMessage.bind(this)}>Подписать</button>
                  </div>
                </div>
              }
            </div>
          }

          <div className={this.state.showTechCon ? '' : 'invisible'}>
            <table className="table table-bordered table-striped">
              <tbody>
                <tr>
                  <td style={{width: '40%'}}><b>Сформированный ТУ</b></td>  
                  <td><a className="text-info pointer" onClick={this.printTechCon.bind(this, apz.id, apz.project_name)}>Скачать</a></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="col-sm-12">
          {this.state.showMap && <ShowMap coordinates={apz.project_address_coordinates} />}

          <button className="btn btn-raised btn-info" onClick={this.toggleMap.bind(this, !this.state.showMap)} style={{margin: '20px auto 10px'}}>
            {this.state.showMapText}
          </button>
        </div>

        <div className="col-sm-12">
          {apz.commission && apz.commission.comment &&
            <div className="alert alert-info mt-3">
              {apz.commission.comment}
            </div>
          }
          
          {this.state.heads_responses.length > 0 &&
            <div>
              <h5 className="block-title-2 mt-4 mb-3">Комментарии:</h5>

              <table className="table table-bordered table-striped">
                <tbody>
                  <tr>
                    <th>ФИО</th>
                    <th>Комментарий</th>
                    <th>Дата</th>
                  </tr>
                  {this.state.heads_responses.map(function(item, index) {
                    return(
                      <tr key={index}>
                        <td width="40%">
                          {item.user.name} 
                        </td>
                        <td width="40%">{item.comments}</td>
                        <td>{this.toDate(item.created_at)}</td>
                      </tr>
                      );
                    }.bind(this))
                  }
                </tbody>
              </table>
            </div>
          }

          {this.state.isHead &&
            <div className={this.state.showButtons ? '' : 'invisible'}>
              <div className="btn-group" role="group" aria-label="acceptOrDecline" style={{margin: 'auto', marginTop: '20px', display: 'table'}}>
                <textarea style={{marginBottom: '10px'}} placeholder="Комментарий" rows="7" cols="50" className="form-control" value={this.state.headComment} onChange={this.onHeadCommentChange}></textarea>
                <button className="btn btn-raised btn-success" onClick={this.sendHeadResponse.bind(this, apz.id, true, this.state.headComment)}>
                  Отправить
                </button>
              </div>
            </div>
          }
        </div>

        {apz.state_history.length > 0 &&
          <div className="col-sm-12">
            <h5 className="block-title-2 mb-3 mt-3">Логи</h5>
            <div className="border px-3 py-2">
              {apz.state_history.map(function(state, index) {
                return(
                  <div key={index}>
                    <p className="mb-0">{state.created_at}&emsp;{state.state.name}</p>
                  </div>
                );
              }.bind(this))}
            </div>
          </div>
        }

        <div className="col-sm-12">
          <hr />
          <Link className="btn btn-outline-secondary pull-right" to={'/panel/phone-provider/apz/'}><i className="glyphicon glyphicon-chevron-left"></i> Назад</Link>
        </div>
      </div>
    )
  }
}

class ShowMap extends React.Component {
  render() {
    const options = {
      url: 'https://js.arcgis.com/4.6/'
    };

    var coordinates = this.props.coordinates;

    return (
      <div>
        <h5 className="block-title-2 mt-5 mb-3">Карта</h5>
        <div className="col-md-12 viewDiv"> 
          <EsriLoaderReact options={options} 
            modulesToLoad={[
              'esri/views/MapView',
              
              'esri/widgets/LayerList',

              'esri/WebScene',
              'esri/layers/FeatureLayer',
              'esri/layers/TileLayer',
              'esri/widgets/Search',
              'esri/WebMap',
              'esri/geometry/support/webMercatorUtils',
              'dojo/dom',
              'esri/Graphic',
              'dojo/domReady!'
            ]}    
            
            onReady={({loadedModules: [MapView, LayerList, WebScene, FeatureLayer, TileLayer, Search, WebMap, webMercatorUtils, dom, Graphic], containerNode}) => {
              var map = new WebMap({
                portalItem: {
                  id: "eee53cd3ef0949ae8c7bc25f92cee3aa"
                }
              });
              
              if (coordinates) {
                var coordinatesArray = coordinates.split(", ");

                var view = new MapView({
                  container: containerNode,
                  map: map,
                  center: [parseFloat(coordinatesArray[0]), parseFloat(coordinatesArray[1])], 
                  scale: 10000
                });

                var point = {
                  type: "point",
                  longitude: parseFloat(coordinatesArray[0]),
                  latitude: parseFloat(coordinatesArray[1])
                };

                var markerSymbol = {
                  type: "simple-marker",
                  color: [226, 119, 40],
                  outline: {
                    color: [255, 255, 255],
                    width: 2
                  }
                };

                var pointGraphic = new Graphic({
                  geometry: point,
                  symbol: markerSymbol
                });

                view.graphics.add(pointGraphic);
              } else {
                  view = new MapView({
                  container: containerNode,
                  map: map,
                  center: [76.886, 43.250], 
                  scale: 10000
                });
              }
              
              var searchWidget = new Search({
                view: view,
                sources: [{
                  featureLayer: new FeatureLayer({
                    url: "https://gis.uaig.kz/server/rest/services/Hosted/%D0%97%D0%B0%D1%80%D0%B5%D0%B3%D0%B8%D1%81%D1%82%D1%80%D0%B8%D1%80%D0%BE%D0%B2%D0%B0%D0%BD%D0%BD%D1%8B%D0%B5_%D0%B3%D0%BE%D1%81%D1%83%D0%B4%D0%B0%D1%80%D1%81%D1%82%D0%B2%D0%B5%D0%BD%D0%BD%D1%8B%D0%B5_%D0%B0%D0%BA%D1%82%D1%8B/FeatureServer",
                    popupTemplate: { // autocasts as new PopupTemplate()
                      title: "Кадастровый номер: {cadastral_number} </br> Назначение: {function} <br/> Вид собственности: {ownership}"
                    }
                  }),
                  searchFields: ["cadastral_number"],
                  displayField: "cadastral_number",
                  exactMatch: false,
                  outFields: ["cadastral_number", "function", "ownership"],
                  name: "Зарегистрированные государственные акты",
                  placeholder: "Кадастровый поиск"
                }]
              });
    
              view.when( function(callback){
                var layerList = new LayerList({
                  view: view
                });

                // Add the search widget to the top right corner of the view
                view.ui.add(searchWidget, {
                  position: "top-right"
                });

                // Add widget to the bottom right corner of the view
                view.ui.add(layerList, "bottom-right");

              }, function(error) {
                console.log('MapView promise rejected! Message: ', error);
              });
            }}
          /> 
        </div>
      </div>
    )
  }
}