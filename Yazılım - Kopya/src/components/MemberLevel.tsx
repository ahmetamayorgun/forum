import React from 'react';
import { getMemberLevel, MEMBER_LEVELS } from '../lib/supabase';

interface MemberLevelProps {
  points: number;
  showName?: boolean;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const MemberLevel: React.FC<MemberLevelProps> = ({
  points,
  showName = false,
  size = 'medium',
  className = ''
}) => {
  const memberLevel = getMemberLevel(points);
  const nextLevel = Object.values(MEMBER_LEVELS).find(level => level.minPoints > points);
  const progressToNext = nextLevel ? ((points - memberLevel.minPoints) / (nextLevel.minPoints - memberLevel.minPoints)) * 100 : 100;

  return (
    <div className={`member-level ${size} ${className}`}>
      <div className="member-level-icon" title={memberLevel.name}>
        {memberLevel.icon}
      </div>
      {showName && (
        <div className="member-level-info">
          <span className="member-level-name">{memberLevel.name}</span>
          <span className="member-level-points">{points} puan</span>
          {nextLevel && points < nextLevel.minPoints && (
            <div className="member-level-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ 
                    width: `${progressToNext}%`,
                    backgroundColor: memberLevel.color
                  }}
                />
              </div>
              <span className="progress-text">
                {nextLevel.minPoints - points} puan kaldı
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MemberLevel; 