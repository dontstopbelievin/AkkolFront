import React from 'react';
//import * as esriLoader from 'esri-loader';
import Loader from 'react-loader-spinner';
import { Route, Link, NavLink, Switch, Redirect } from 'react-router-dom';

export default class UrbanReport extends React.Component {

  render() {
    return (
      <div className="content container body-content">
        <div className="card">
          <div className="card-header">
            <h4 className="mb-0 h4-inline">Архитектурно-планировочное задание / Отчет</h4>
            <ul className="nav nav-tabs mb-2 pull-right">
              <li className="nav-item"><NavLink activeClassName="nav-link active" className="nav-link nav-link-reports" activeStyle={{color:"black"}} to="/panel/urban/urbanreport/apzs/accepted" replace>Принятые</NavLink></li>
              <li className="nav-item"><NavLink activeClassName="nav-link active" className="nav-link nav-link-reports" activeStyle={{color:"black"}} to="/panel/urban/urbanreport/apzs/declined" replace>Отказанные</NavLink></li>
            </ul>
          </div>
          <div className="card-body">
            <Switch>
              <Route path="/panel/urban/urbanreport/apzs/:status" exact render={(props) =>(
                <ApzListReport {...props} breadCrumbs={this.props.breadCrumbs.bind(this)} />
              )} />
              <Redirect from="/panel/urban/urbanreport" to="/panel/urban/urbanreport/apzs/accepted" />
            </Switch>
          </div>
        </div>
      </div>
    )
  }
}

class ApzListReport extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      acceptedApzs: [],
      declinedApzs: [],
      sortedApzs: [],
      periodClicked: true,
      filtr2Clicked: false,
      startDate: "",
      endDate: "",
      loaderHidden: false
    };

    this.onStartDateChange = this.onStartDateChange.bind(this);
    this.onEndDateChange = this.onEndDateChange.bind(this);
    this.getStyleForSortingType = this.getStyleForSortingType.bind(this);
  }

  onStartDateChange(e) {
    this.setState({ startDate: e.target.value });
  }

  onEndDateChange(e) {
    this.setState({ endDate: e.target.value });
  }

  changeSortingType(sortName){
    if(sortName === 'period'){
      this.setState({
        periodClicked: true,
        filtr2Clicked: false,
        startDate: "",
        endDate: ""
      });
    }
    else{
      this.setState({
        filtr2Clicked: true,
        periodClicked: false
      });
    }
  }

  getStyleForSortingType(isClicked) {
    if(isClicked === true)
      return 'sortingType';
    else
      return 'noStyleSortType';
  }

  componentWillMount() {
    //console.log("inside WillMount");
    if(sessionStorage.getItem('tokenInfo')){
      //console.log("token exist");
      var status = this.props.match.params.status;

      if(JSON.parse(sessionStorage.getItem('userRoles'))[1] === 'Region'){
        this.props.history.replace('/panel/urban/urbanreport/apzs/' + status);
      }
      else {
        this.props.history.replace('/');
      }
    }else {
      //console.log("no token");
      this.props.history.replace('/');
    }
  }

  componentDidMount() {
    this.props.breadCrumbs();
    //console.log("UrbanReport Component didMount");
    if(sessionStorage.getItem('tokenInfo')){
      //console.log("token exist");
      if(JSON.parse(sessionStorage.getItem('userRoles'))[1] === 'Region'){
        this.getApzs();
      }
    }
  }

  // componentWillReceiveProps(nextProps) {
  //   //console.log("componentWillReceiveProps is called");
  //   if(this.props.match.params.status !== nextProps.match.params.status) {
  //     this.sortApzs(nextProps.match.params.status);
  //   }
  // }

  // get the list of all Apzs
  getApzs() {
    var token = sessionStorage.getItem('tokenInfo');
    var xhr = new XMLHttpRequest();
    xhr.open("get", window.url + "api/apz/region", true);
    xhr.setRequestHeader("Authorization", "Bearer " + token);
    xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
    xhr.onload = function () {
      if (xhr.status === 200) {
        var data = JSON.parse(xhr.responseText);

        this.setState({ acceptedApzs: data.accepted });
        this.setState({ declinedApzs: data.declined });
        this.setState({ loaderHidden: true });
      }
      else if (xhr.status === 401) {
        sessionStorage.clear();
        alert("Время сессии истекло. Пожалуйста войдите заново!");
        this.setState({ loaderHidden: true });
        this.props.history.replace("/login");
      }
    }.bind(this);
    xhr.send();
  }

  // give the list sorted by date
  sortByDate(start, end){
    this.setState({loaderHidden: false});

    if(!start || !end){
      alert("Выберите временной отрезок.");
      this.setState({loaderHidden: true});
    }
    else {
      var endDate = this.addDay(end);
      var token = sessionStorage.getItem('tokenInfo');
      var xhr = new XMLHttpRequest();
      xhr.open("get", window.url + "api/apz/region?start_date=" + start + "&end_date=" + endDate, true);
      xhr.setRequestHeader("Authorization", "Bearer " + token);
      xhr.setRequestHeader("Content-type", "application/json; charset=UTF-8");
      xhr.onload = function () {
        if (xhr.status === 200) {
          var data = JSON.parse(xhr.responseText);
          //console.log(data);
          this.setState({acceptedApzs: data.accepted});
          this.setState({declinedApzs: data.declined});
        }
        else if (xhr.status === 404) {
          this.setState({sortedApzs: []});
          alert("По данному запросу ничего не найдено.");
          this.setState({loaderHidden: true});
        }
        else if (xhr.status === 401){
          sessionStorage.clear();
          alert("Время сессии истекло. Пожалуйста войдите заново!");
          this.setState({loaderHidden: true});
          this.props.history.replace("/login");
        }

        this.setState({loaderHidden: true});
      }.bind(this);
      xhr.send();
    }
  }

  // add a day to endDate
  addDay(endDate){
    var end = new Date(endDate);
    end.setDate(end.getDate() + 1);
    var day = end.getDate();
    var month = end.getMonth() + 1;
    var year = end.getFullYear();
    var formatedDate = year + "-" + month + "-" + day;
    return formatedDate;
  }

  render() {
    var apzs = [];

    if(this.props.match.params.status === 'accepted'){
      apzs = this.state.acceptedApzs;
    } else {
      apzs = this.state.declinedApzs;
    }

    return (
      <div className="row">
        <div className="col-2">
          <table className="table">
            <thead>
              <tr>
                <th>Фильтр</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className={this.getStyleForSortingType(this.state.periodClicked)} onClick={this.changeSortingType.bind(this, 'period')}>За период</td>
              </tr>
              <tr>
                <td className={this.getStyleForSortingType(this.state.filtr2Clicked)} onClick={this.changeSortingType.bind(this, 'filtr2')}>Второй фильтр</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div className="col-10">
          <div className="row sorting-period-header">
            <div className="col-5">
              От: <input type="date" value={this.state.startDate} onChange={this.onStartDateChange} className="form-control" name="ApzDate" />
            </div>
            <div className="col-5"> 
              До: <input type="date" value={this.state.endDate} onChange={this.onEndDateChange} className="form-control" name="ApzDate" />
            </div>
            <div className="col-2">
              <button className="btn btn-outline-info" onClick={this.sortByDate.bind(this, this.state.startDate, this.state.endDate)}>Найти</button>
            </div>  
          </div>
          <div className="row sorted-info-body">
            {this.state.loaderHidden &&
              <table className="table">
                <thead>
                  <tr>
                    <th style={{width: '50%'}}><b>Общее количество:</b></th>
                    <th style={{width: '50%'}}>{apzs.length}</th>
                  </tr>
                </thead>
                <tbody>
                  {apzs.length > 0 &&
                    <tr style={{textAlign: 'center', fontSize: '18px', color: 'peru'}}>
                      <td colSpan="2">Список заявлении</td>
                    </tr>
                  }
                  {apzs.length > 0 &&
                    <tr>
                      <td><b>Название</b></td>
                      <td><b>Детали</b></td>
                    </tr>
                  }
                  {apzs.map(function(apz, index) {
                    return(
                      <tr key={index}>
                        <td>{apz.project_name}</td>
                        <td>
                          <Link className="btn btn-outline-info" to={'/urban/' + apz.id}><i className="glyphicon glyphicon-eye-open mr-2"></i> Просмотр</Link>
                        </td>
                      </tr>
                      );
                    })
                  }
                </tbody>
              </table>
            }

            {!this.state.loaderHidden &&
              <div style={{margin: '0 auto'}}>
                <Loader type="Oval" color="#46B3F2" height="200" width="200" />
              </div>
            }
          </div>
        </div>
      </div>
    )
  }
}