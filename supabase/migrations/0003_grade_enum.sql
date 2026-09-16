-- 0003: 원본 학년 체계(예비초~고3·기타) 반영 — grade_code enum 확장
alter type grade_code add value if not exists 'e0'; -- 예비초
alter type grade_code add value if not exists 'e1'; alter type grade_code add value if not exists 'e2'; alter type grade_code add value if not exists 'e3';
alter type grade_code add value if not exists 'e4'; alter type grade_code add value if not exists 'e5'; alter type grade_code add value if not exists 'e6';
alter type grade_code add value if not exists 'm1'; alter type grade_code add value if not exists 'm2'; alter type grade_code add value if not exists 'm3';
