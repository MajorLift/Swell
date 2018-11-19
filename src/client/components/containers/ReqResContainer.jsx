import React, { Component } from 'react';
import { connect } from 'react-redux';

import * as actions from '../../actions/actions';
import ReqRes from '../display/ReqRes.jsx';

const mapStateToProps = store => ({
  reqRes : store.business.reqResArray,
});

const mapDispatchToProps = dispatch => ({

});

class ReqResContainer extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    let reqResArr = this.props.reqRes.map((reqRes,index) => {
      return <ReqRes className="reqResChild" content={reqRes} key={index}></ReqRes>
    });
    return(
      <div id="reqResContainer" style={{'border' : '1px solid black'}}>
        ReqResContainer
        {reqResArr}
      </div>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ReqResContainer);