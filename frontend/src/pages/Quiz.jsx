import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';

const Quiz = () => {
  const navigate = useNavigate();
  const { selectedProduct, selectedCategory, conditions, setConditions, getQuote } = useShop();
  const [isCalculating, setIsCalculating] = useState(false);

  useEffect(() => {
    if (!selectedProduct) {
      navigate('/');
    }
  }, [selectedProduct, navigate]);

  const handleConditionChange = (key, value) => {
    setConditions(prev => ({ ...prev, [key]: value }));
  };

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      await getQuote();
      navigate('/quote');
    } catch (err) {
      console.error(err);
      alert('Failed to calculate quote. Please try again.');
    } finally {
      setIsCalculating(false);
    }
  };

  const renderQuizQuestions = () => {
    if (selectedCategory === 'Laptops') {
      return (
        <>
          <div className="quiz-question">
            <h4>1. Does your Laptop turn on and function normally?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.turnsOn === true ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', true)}>Yes, flawless</div>
              <div className={`option-card ${conditions.turnsOn === false ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', false)}>No / Dead</div>
            </div>
          </div>
          {conditions.turnsOn && (
            <>
              <div className="quiz-question">
                <h4>2. What is the screen condition?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.screen === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'perfect')}>Flawless</div>
                  <div className={`option-card ${conditions.screen === 'scratches' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'scratches')}>Scratches</div>
                  <div className={`option-card ${conditions.screen === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'broken')}>Cracked/Spots</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>3. What is the Keyboard / Trackpad condition?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.keyboard === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('keyboard', 'perfect')}>Perfect</div>
                  <div className={`option-card ${conditions.keyboard === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('keyboard', 'broken')}>Missing keys/Faulty</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>4. How old is your Laptop?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.age === 'under_1' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'under_1')}>Under 1 Year</div>
                  <div className={`option-card ${conditions.age === '1_year' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '1_year')}>1 - 2 Years</div>
                  <div className={`option-card ${conditions.age === '2_years' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '2_years')}>2 - 3 Years</div>
                  <div className={`option-card ${conditions.age === 'more_than_2' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'more_than_2')}>3+ Years</div>
                </div>
              </div>
            </>
          )}
        </>
      );
    } else if (selectedCategory === 'Earbuds') {
      return (
        <>
          <div className="quiz-question">
            <h4>1. Do you have the original charging case?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.hasCase === true ? 'selected' : ''}`} onClick={() => handleConditionChange('hasCase', true)}>Yes</div>
              <div className={`option-card ${conditions.hasCase === false ? 'selected' : ''}`} onClick={() => handleConditionChange('hasCase', false)}>No</div>
            </div>
          </div>
          <div className="quiz-question">
            <h4>2. Do both earbuds work clearly?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.bothWork === true ? 'selected' : ''}`} onClick={() => handleConditionChange('bothWork', true)}>Yes</div>
              <div className={`option-card ${conditions.bothWork === false ? 'selected' : ''}`} onClick={() => handleConditionChange('bothWork', false)}>No / One is dead</div>
            </div>
          </div>
          <div className="quiz-question">
            <h4>3. How old are your earbuds?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.age === 'under_1' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'under_1')}>Under 1 Year</div>
              <div className={`option-card ${conditions.age === '1_year' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '1_year')}>1+ Year</div>
            </div>
          </div>
        </>
      );
    } else if (selectedCategory === 'Accessories') {
      return (
        <>
          <div className="quiz-question">
            <h4>1. Does the smartwatch power on?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.turnsOn === true ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', true)}>Yes</div>
              <div className={`option-card ${conditions.turnsOn === false ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', false)}>No</div>
            </div>
          </div>
          {conditions.turnsOn && (
            <>
              <div className="quiz-question">
                <h4>2. Screen & Body Condition?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.screen === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'perfect')}>Flawless</div>
                  <div className={`option-card ${conditions.screen === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'broken')}>Cracked Screen</div>
                  <div className={`option-card ${conditions.strap === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('strap', 'broken')}>Broken Strap</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>3. How old is the watch?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.age === 'under_1' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'under_1')}>Under 1 Year</div>
                  <div className={`option-card ${conditions.age === '1_year' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '1_year')}>1+ Year</div>
                </div>
              </div>
            </>
          )}
        </>
      );
    } else { // Mobiles
      return (
        <>
          <div className="quiz-question">
            <h4>1. Does your device turn on and function normally?</h4>
            <div className="options-grid">
              <div className={`option-card ${conditions.turnsOn === true ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', true)}>Yes, flawless</div>
              <div className={`option-card ${conditions.turnsOn === false ? 'selected' : ''}`} onClick={() => handleConditionChange('turnsOn', false)}>No</div>
            </div>
          </div>
          {conditions.turnsOn && (
            <>
              <div className="quiz-question">
                <h4>2. Screen Condition</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.screen === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'perfect')}>Flawless</div>
                  <div className={`option-card ${conditions.screen === 'scratches' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'scratches')}>Minor Scratches</div>
                  <div className={`option-card ${conditions.screen === 'broken' ? 'selected' : ''}`} onClick={() => handleConditionChange('screen', 'broken')}>Cracked/Broken</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>3. Back Panel & Body</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.body === 'perfect' ? 'selected' : ''}`} onClick={() => handleConditionChange('body', 'perfect')}>Flawless</div>
                  <div className={`option-card ${conditions.body === 'scratches' ? 'selected' : ''}`} onClick={() => handleConditionChange('body', 'scratches')}>Scratches</div>
                  <div className={`option-card ${conditions.body === 'dents' ? 'selected' : ''}`} onClick={() => handleConditionChange('body', 'dents')}>Dented</div>
                </div>
              </div>
              <div className="quiz-question">
                <h4>4. How old is your Mobile?</h4>
                <div className="options-grid">
                  <div className={`option-card ${conditions.age === 'under_1' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'under_1')}>Under 1 Year</div>
                  <div className={`option-card ${conditions.age === '1_year' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '1_year')}>1 - 2 Years</div>
                  <div className={`option-card ${conditions.age === '2_years' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', '2_years')}>2 - 3 Years</div>
                  <div className={`option-card ${conditions.age === 'more_than_2' ? 'selected' : ''}`} onClick={() => handleConditionChange('age', 'more_than_2')}>3+ Years</div>
                </div>
              </div>
            </>
          )}
        </>
      );
    }
  };

  if (!selectedProduct) return null;

  return (
    <div className="fade-in section">
      <div className="glass-panel quiz-container">
        <div className="quiz-header">
          <h2 style={{ fontSize: '2rem' }}>Evaluate your {selectedProduct.name}</h2>
          <p style={{ color: 'var(--text-muted)' }}>Answer exactly to get the best {selectedCategory.toLowerCase()} quote.</p>
        </div>

        {renderQuizQuestions()}

        <div style={{ marginTop: '3rem', display: 'flex', gap: '1.5rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/')}>Back to catalog</button>
          <button className="btn" onClick={handleCalculate} disabled={isCalculating}>
            {isCalculating ? 'Calculating...' : 'Calculate Exact Value'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Quiz;
