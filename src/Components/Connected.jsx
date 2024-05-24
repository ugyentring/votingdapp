import React from "react";

const Connected = (props) => {
  return (
    <div className="connected-container">
      <h1 className="connected-header">Connected to Metamask</h1>
      <p
        className="connected-account"
        style={{
          backgroundColor: "gray",
          padding: "8px",
          color: "white",
          borderRadius: "8px",
          boxShadow: "0 3px 4px rgba(4, 5, 6, 3)",
        }}
      >
        Metamask Account: {props.account}
      </p>
      <p className="connected-account">Remaining Time: {props.remainingTime}</p>
      {props.showButton ? (
        <p style={{ color: "red" }} className="connected-account">
          You have already voted
        </p>
      ) : (
        <div>
          <input
            style={{
              outline: "none",
              border: "none",
              padding: "10px",
              width: "100%",
            }}
            type="number"
            placeholder="Entern Candidate Index"
            value={props.number}
            onChange={props.handleNumberChange}
          ></input>
          <br />
          <button
            style={{ width: "100%" }}
            className="login-button"
            onClick={props.voteFunction}
          >
            Vote
          </button>
        </div>
      )}

      <table id="myTable" className="candidates-table">
        <thead>
          <tr>
            <th>Index</th>
            <th>Candidate name</th>
            <th>Candidate votes</th>
          </tr>
        </thead>
        <tbody>
          {props.candidates.map((candidate, index) => (
            <tr key={index}>
              <td>{candidate.index}</td>
              <td>{candidate.name}</td>
              <td>{candidate.voteCount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Connected;
