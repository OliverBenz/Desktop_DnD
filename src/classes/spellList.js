import React, { Component } from 'react';

import {
  Search,
  Card,
  NavButtons,
  ActivityIndicator
} from '../components/componentNav';

export default class SpellList extends Component{
 
  constructor(props){
    super(props);

    this.state = {
      spellList: [],
      search: "",

      spellsPerPage: 10,
      page: 1,
      pageCount: 201,

      isLoading: false
    }
  }

  componentDidMount(){
    this._getSpellList(1, this.state.search);
  }

  render(){
    if(this.state.isLoading){
      // TODO: Center indivator to center of screen
      return (
        <div style={{alignItems: 'center', justifyContent: 'center'}}>
          <ActivityIndicator size="large" color="#0000ff" />
        </div>
      );
    }

    return(
      <div>
        <span style={{display: 'flex', justifyContent: 'center', alignItems: 'center', margin: 10}}>
          <Search
            inputStyle={{ width: '300px' }}
            value={this.state.search}
            placeholder="Search..."
            onChange={(e) => this.setState({search: e})}
            onClear={() => this._clearFilter()}
            onConfirm={() => this._getSpellList(1, this.state.search)}
          />
        </span>

        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' }}>
          { this.state.spellList.map(s => ( <Card spell={s} onClick={() => this.props.history.push(`/spellSpec/${s.id}`)} /> )) }
        </div>

        <NavButtons
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px' }}
          pageCount={this.state.pageCount}
          page={this.state.page}

          onChange={(page) => this.setState({ page: page })}
          onEnter={(page) => this._onEnter(page)}
          onClickNext={() => this._onClickNext()}
          onClickBack={() => this._onClickBack()}
        />
      </div>
    );
  }

  _onEnter = (page) => {
    this.setState({ page: parseInt(page) });
    this._getSpellList(page, this.state.search);
  }

  _onClickBack = () => {
    const { page, search } = this.state;
    
    if(page > 1){
      this._getSpellList(page - 1, search);
      this.setState({ page: page - 1 });
    }
  }

  _onClickNext = () => {
    const { page, pageCount, search } = this.state;

    if(page < pageCount){
      this._getSpellList(page + 1, search);
      this.setState({ page: page + 1 });    
    }
  }

  _clearFilter = () => {
    this.setState({ search: "" });
    this._getSpellList(1, undefined);
  }

  _getSpellList = (page, search) => {
    const spellPerPage = this.state.spellsPerPage;
    const offset = (page - 1) * spellPerPage;
    let url = localStorage.getItem('url') + `/general/spells/${offset}/${spellPerPage}`;

    url += search === undefined ? '' : `/${search}`;
    
    fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => res.json())
    .then((resJ) => {
      if(resJ.success && resJ.data.length !== 0){
        this._getPageCount();
        this.setState({ spellList: resJ.data });
        if(this.state.isLoading) this.setState({ isLoading: false });
      }
    });
  }

  _getPageCount = () => {
    const { search } = this.state;
    let url = localStorage.getItem('url') + "/general/spellCount";
    url += search === undefined ? '' : `/${search}`;

    fetch(url, {
      method : 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })
    .then((res) => res.json())
    .then((resJ) => {
      let pageCount = Math.ceil(resJ.data / this.state.spellsPerPage);
      this.setState({ pageCount });
    });
  }
}
