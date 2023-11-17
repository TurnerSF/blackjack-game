import React, { useState, useEffect, useCallback } from "react";
import "./index.css";

const GetDeck = () => {
  const [deck, setDeck] = useState({});
  const [playerHand, setPlayerHand] = useState([]);
  const [dealerHand, setDealerHand] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [playerTurnOver, setPlayerTurnOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [playerBusted, setPlayerBusted] = useState(false);
  const [hideSecondDealerCard, setHideSecondDealerCard] = useState(true);
  const [playerBlackjack, setPlayerBlackjack] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError(null);

    fetch("https://www.deckofcardsapi.com/api/deck/new/shuffle/?deck_count=5")
      .then((res) => res.json())
      .then((data) => {
        setDeck(data);
        setLoading(false);
      })
      .catch((error) => {
        setError("Error fetching deck: " + error.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (deck && deck.deck_id) {
      setLoading(true);
      setError(null);

      // Draw 2 cards for the player
      fetch(
        `https://www.deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=2`
      )
        .then((res) => res.json())
        .then((data) => {
          setPlayerHand(data.cards);
          setLoading(false);
        })
        .catch((error) => {
          setError("Error fetching player's cards: " + error.message);
          setLoading(false);
        });

      // Draw 2 cards for the dealer
      fetch(
        `https://www.deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=2`
      )
        .then((res) => res.json())
        .then((data) => {
          setDealerHand(data.cards);
          setLoading(false);
        })
        .catch((error) => {
          setError("Error fetching dealer's cards: " + error.message);
          setLoading(false);
        });
    }
  }, [deck]);

  const calculateHandTotal = useCallback((hand) => {
    let sum = hand.reduce((sum, card) => {
      const value =
        card.value === "KING" || card.value === "QUEEN" || card.value === "JACK"
          ? 10
          : card.value === "ACE"
          ? 11
          : parseInt(card.value);

      return sum + value;
    }, 0);

    hand.forEach((card) => {
      if (card.value === "ACE" && sum > 21) {
        sum -= 10;
      }
    });

    return sum;
  }, []);

  useEffect(() => {
    // Check if the initial deal results in a blackjack (total of 21)
    const playerTotal = calculateHandTotal(playerHand);
    if (playerTotal === 21 && playerHand.length === 2) {
      setPlayerTurnOver(true);
      setPlayerBlackjack(true);
      console.log(playerHand)
    }
  }, [playerHand, calculateHandTotal]);

  useEffect(() => {
    if (playerTurnOver) {
      const playerTotal = calculateHandTotal(playerHand);
      const dealerTotal = calculateHandTotal(dealerHand);

      if (playerTotal > 21) {
        setWinner("Dealer");
      } else if (
        dealerTotal > 21 ||
        (playerTotal <= 21 && playerTotal > dealerTotal)
      ) {
        setWinner("Player");
      } else if (playerTotal === dealerTotal) {
        setWinner("Tie");
      } else {
        setWinner("Dealer");
      }
    }
  }, [playerTurnOver, dealerHand, playerHand, calculateHandTotal]);

  const handleHit = () => {
    if (!playerTurnOver && !playerBusted && !playerBlackjack) {
      const newPlayerHand = [...playerHand];

      fetch(
        `https://www.deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=1`
      )
        .then((res) => res.json())
        .then((data) => {
          newPlayerHand.push(...data.cards);
          setPlayerHand(newPlayerHand);

          const playerTotal = calculateHandTotal(newPlayerHand);
          if (playerTotal > 21) {
            setPlayerTurnOver(true);
            setPlayerBusted(true);
          } else if (playerTotal === 21) {
            setPlayerTurnOver(true);
            setPlayerBlackjack(true);
          } else if (playerHand.length === 2 && playerTotal === 21) {
            setPlayerBlackjack(true);
          }
        })
        .catch((error) =>
          console.error("Error fetching player's cards:", error)
        );
    }
  };


  const handleStay = () => {
    setPlayerTurnOver(true);
    setHideSecondDealerCard(false);
  };

  const handleDealerTurn = useCallback(async () => {
    if (playerTurnOver && !playerBusted && !playerBlackjack) {
      let dealerTotal = calculateHandTotal(dealerHand);
  
      while (
        dealerTotal < 17 ||
        (dealerTotal === 17 && dealerHand.some((card) => card.value === "ACE"))
      ) {
        try {
          const response = await fetch(
            `https://www.deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=1`
          );
          const data = await response.json();
  
          setDealerHand((prevDealerHand) => [...prevDealerHand, ...data.cards]);
  
          await new Promise((resolve) => setTimeout(resolve, 1000));
  
          dealerTotal = calculateHandTotal((prevDealerHand) => [
            ...prevDealerHand,
            ...data.cards,
          ]);
        } catch (error) {
          console.error("Error fetching dealer's cards:", error);
          break;
        }
      }
    }
  }, [playerTurnOver, dealerHand, deck.deck_id, calculateHandTotal, playerBusted, playerBlackjack]);

  useEffect(() => {
    if (playerTurnOver) {
      setHideSecondDealerCard(false); // Show the second dealer card when player's turn is over
      handleDealerTurn(); // Proceed with dealer's turn
    }
  }, [playerTurnOver, handleDealerTurn]);

  const resetGame = () => {
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerTurnOver(false);
    setWinner(null);
    setPlayerBusted(false);
    setHideSecondDealerCard(true);
    setPlayerBlackjack(false);

    fetch(
      `https://www.deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=2`
    )
      .then((res) => res.json())
      .then((data) => {
        setPlayerHand(data.cards);
      })
      .catch((error) => {
        setError("Error fetching player's cards: " + error.message);
      });

    fetch(
      `https://www.deckofcardsapi.com/api/deck/${deck.deck_id}/draw/?count=2`
    )
      .then((res) => res.json())
      .then((data) => {
        setDealerHand(data.cards);
      })
      .catch((error) => {
        setError("Error fetching dealer's cards: " + error.message);
      });
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <div className="dealers-container">
        <h2>Dealer's Hand:</h2>
        {dealerHand.map((dealerCard, index) => (
          <div key={dealerCard.code} className="dealers">
            <img
              src={
                index === 1 && hideSecondDealerCard
                  ? "https://www.deckofcardsapi.com/static/img/back.png"
                  : dealerCard.image
              }
              alt={`${dealerCard.value} of ${dealerCard.suit}`}
            />
            <p>{`${dealerCard.value} of ${dealerCard.suit}`}</p>
          </div>
        ))}
      </div>
      <div className="players-container">
        <h2>Player's Hand:</h2>
        {playerHand.map((playerCard) => (
          <div key={playerCard.code} className="players">
            <img
              src={playerCard.image}
              alt={`${playerCard.value} of ${playerCard.suit}`}
            />
            <p>{`${playerCard.value} of ${playerCard.suit}`}</p>
          </div>
        ))}
        <div className="players-choice">
          <>
            <p className="total">{calculateHandTotal(playerHand)}</p>
            {!playerTurnOver && (
              <>
                <button className="stay" onClick={handleStay}>
                  Stay
                </button>
                <button className="hit" onClick={handleHit}>
                  Hit
                </button>
              </>
            )}
          </>
        </div>
      </div>
      {playerTurnOver && winner && <h2 className="winner">Winner: {winner}</h2>}
      {winner && (
        <div >
          <button onClick={resetGame} className="new-game">New Game</button>
        </div>
      )}
    </div>
  );
};

export default GetDeck;
