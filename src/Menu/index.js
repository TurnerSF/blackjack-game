import React from "react";
import "./index.css"
import { Link } from "react-router-dom";
import blackjackLogo from "../assets/blackjackLogo.svg"
import whatsTheDeal from "../assets/whats-the-deal.svg"
import secondaryTitle from "../assets/secondary-title.svg"

const Menu = () => {
  return (
    <div className="menu">
      <img className="title" src={whatsTheDeal} alt="Title" />
      <img className="game-type" src={blackjackLogo} alt="blackjack Logo" />
      <img className="second-title" src={secondaryTitle} alt="online blackjack" />
      <ul className="selection">
        <li>
          <Link to="/game" activeclass="active" exact="true">
            <button className="start">Start Game</button>
          </Link>
        </li>
        <li>
          <Link to="how-to-play" activeclass="active" exact="true">
            <button className="how">How to play</button>
          </Link>
        </li>
        <li>
          <Link to="learn-more" activeclass="active" exact="true">
            <button className="learn">Learn more</button>
          </Link>
        </li>
      </ul>
    </div>
  );
};

export default Menu;
