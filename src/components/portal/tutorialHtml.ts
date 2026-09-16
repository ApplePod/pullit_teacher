// 원본 상단 튜토리얼 영역(#wrap > .tutorial-btn-wrap)과 두 모달 마크업 verbatim
export const TUTORIAL_BTN_HTML = `<div class="tutorial-btn-wrap d-flex"><div class="tutorial-btn-group gap-2"><button type="button" class="text-primary fw-700" data-bs-toggle="modal" data-bs-target="#modal-tutorial">
            튜토리얼
        </button><button type="button" class="text-primary fw-700" data-bs-toggle="modal" data-bs-target="#onboarding">
            신구버전 비교안내
        </button></div><button type="button" id="btn-tutorial" class="button__line button__fill--medium button__fill--blue"><i class="fa-solid fa-question"></i></button></div>`;

export const TUTORIAL_MODAL_HTML = `<div class="modal fade modal-inner-scroll write-modal" id="modal-tutorial" tabindex="-1" aria-modal="true" role="dialog"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-body p-64"><h2 class="d-flex justify-content-center f-24">원하는 튜토리얼 메뉴를 선택해주세요!</h2><p class="d-flex justify-content-center mt-16 fw-normal f-14">*튜토리얼은 쉽고 직관적인 이해를 위해 팝업창 및 옵션 과정 일부를 생략하였습니다.</p><div class="d-flex flex-column gap-3 mt-24"><a href="/Pages/Center/Dashboard/tutorial/center/auto/" target="_blank" class="button__line button__fill--medium button__fill--blue w-100 f-16 h-48">
                        문제지 만들기 자동출제 바로가기
                        <i class="material-symbols-sharp">arrow_forward_ios</i></a><a href="/Pages/Center/Dashboard/tutorial/center/direct/" target="_blank" class="button__line button__fill--medium button__fill--blue w-100 f-16 h-48">
                        문제지 만들기 직접출제 바로가기
                        <i class="material-symbols-sharp">arrow_forward_ios</i></a><a href="/Pages/Center/Dashboard/tutorial/center/matching/" target="_blank" class="button__line button__fill--medium button__fill--blue w-100 f-16 h-48">
                        교재매칭 쌍둥이 문제 만들기 바로가기
                        <i class="material-symbols-sharp">arrow_forward_ios</i></a><a href="/Pages/Center/Dashboard/tutorial/center/scoringClinic/" target="_blank" class="button__line button__fill--medium button__fill--blue w-100 f-16 h-48">
                        학생별 오답 클리닉 바로가기
                        <i class="material-symbols-sharp">arrow_forward_ios</i></a><a href="/Pages/Center/Dashboard/tutorial/center/analysis/" target="_blank" class="button__line button__fill--medium button__fill--blue w-100 f-16 h-48">
                        학습분석표 7종 바로가기
                        <i class="material-symbols-sharp">arrow_forward_ios</i></a><a href="https://www.youtube.com/playlist?list=PL0nLmiJ1KjRwcVTCGxonHYeP2OvUV-Aqg" target="_blank" class="button__line button__fill--medium button__fill--blue w-100 f-16 h-48">
                        메뉴별 사용법 영상 보기
                        <i class="material-symbols-sharp">arrow_forward_ios</i></a><button type="button" class="button__fill button__line--small button__line--white button__weight--medium h-48"
                            data-bs-dismiss="modal">
                        나가기
                    </button></div></div></div></div></div>`;

export const ONBOARDING_MODAL_HTML = `<div class="modal fade modal-inner-scroll max-full" id="onboarding" tabindex="-1" aria-modal="true" role="dialog"><div class="modal-dialog modal-dialog-centered"><div class="modal-content"><div class="modal-header"><h6 class="f-14">뉴 메타수학 안내</h6><button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"><span class="material-symbols-sharp">close</span></button></div><div class="modal-body"><ul class="list-tab list-tab--1 mb-16" role="tablist"><li class="nav-item"><button class="nav-link active" data-bs-toggle="tab" data-bs-target="#tab-pane-onboarding-1"
                                type="button" role="tab">
                            홈화면(대시보드)
                        </button></li><li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-pane-onboarding-2"
                                type="button" role="tab">
                            수업
                        </button></li><li class="nav-item"><button class="nav-link" data-bs-toggle="tab" data-bs-target="#tab-pane-onboarding-3"
                                type="button" role="tab">
                            교실/운영관리
                        </button></li></ul><div class="tab-content onboarding--content" id="myTabContent"><div class="tab-pane fade" id="tab-pane-onboarding-0" role="tabpanel" tabindex="0"><div class="onboarding"
                             style="right: 0px; max-height: 650px; overflow-x: hidden; overflow-y: auto; margin-bottom: 0;	"></div></div><div class="tab-pane fade  show active" id="tab-pane-onboarding-1" role="tabpanel" tabindex="0"><div class="onboarding" style="right: 0px; max-height: 650px; overflow-x: hidden; overflow-y: auto; margin-bottom: 0"><div class="m-container"><div class="onboarding__wrap"><div class="onboarding__left"><ul><li><a href="#seciton1-01" class="scroll active">홈화면(대시보드)</a><li><a href="#seciton1-02" class="scroll">문제지 만들기 바로가기</a><li><a href="#seciton1-03" class="scroll">교재매칭 문제지 만들기</a><li><a href="#seciton1-04" class="scroll">교과학습 문제지 만들기</a><li><a href="#seciton1-05" class="scroll">직접출제</a><li><a href="#seciton1-06" class="scroll">평가 문제지 만들기</a><li><a href="#seciton1-07" class="scroll">수능 모의고사 기출 문제지 만들기</a><li><a href="#seciton1-08" class="scroll">학습 분석표 바로가기</a><li><a href="#seciton1-09" class="scroll">문제지 목록 | 수업 바로가기</a></ul></div><div class="onboarding__body"><div class="onboarding__headline"><h3 class="onboarding__stitle">기존 메타수학</h3><h3 class="onboarding__stitle">신규 메타수학</h3></div><div class="onboarding__content"><section id="seciton1-01"><article><h4 class="onboarding__title">홈화면(대시보드)</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0101.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">홈화면(대시보드)</h4><p class="onboarding__info">
                                                        접근성을 높이고 한 눈에 현황을 파악할 수 있도록 대시보드가 새롭게
                                                        변경되었어요
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0102.png"
                                                             alt="" /></div></article></section><section id="seciton1-02"><article><h4 class="onboarding__title">문제지 만들기 바로가기</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 52px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0103.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">문제지 만들기 바로가기</h4><p class="onboarding__info">
                                                        언제 어디서든 바로 문제지를 만들 수 있도록, 교실홈 모든 화면의 상단에
                                                        ‘문제지 만들기’ 버튼이 생겼어요 <br>
                                                        '문제지 만들기' 버튼을 누르면 '교재매칭', '교과학습', '평가', '수능모의고사 기출' 등 모든 문제지를 만들
                                                        수 있어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0104.png"
                                                             alt="" /></div></article></section><section id="seciton1-03"><article><h4 class="onboarding__title">교재매칭 문제지 만들기</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0105.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">교재매칭 문제지 만들기</h4><p class="onboarding__info">
                                                        문제지 만들기 첫 단계에서 출제방식 선택을 통해 교재매칭 문제지를 제작할
                                                        수 있게 되었어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0106.png"
                                                             alt="" /></div></article></section><section id="seciton1-04"><article><h4 class="onboarding__title">교과학습 문제지 만들기(자동출제)</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0107.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">교과학습 문제지 만들기</h4><p class="onboarding__info">
                                                        문제지 만들기 첫 단계에서 학습종류 선택을 통해 교과학습 문제지를 제작할
                                                        수 있게 되었어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0108.png"
                                                             alt="" /></div></article></section><section id="seciton1-05"><article><h4 class="onboarding__title">교과학습 문제지 만들기>직접출제</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0109.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">직접출제</h4><p class="onboarding__info">
                                                        출제방식에서 직접출제를 선택 후 학습 종류를 골라주면 문항을 직접 보며
                                                        고를 수 있어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0110.png"
                                                             alt="" /></div></article></section><section id="seciton1-06"><article><h4 class="onboarding__title">평가 문제지 만들기</h4><p class="onboarding__info">평가 문제지 만들기 어떻게 바뀌었을까요?</p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0111.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">평가 문제지 만들기</h4><p class="onboarding__info">
                                                        '문제지 만들기' 화면의 오른쪽 사이드에 있는 화살표를 누르면 '문제지
                                                        옵션'을 설정할 수 있는 드로우 바가 열려요. 옵션에서 '문제지 종류'를 '평가지'로 선택하면 모든 종류의 문제지를
                                                        '평가지'로 바꿀 수 있어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0112.png"
                                                             alt="" /></div></article></section><section id="seciton1-07"><article><h4 class="onboarding__title">수능 모의고사 기출 문제지 만들기</h4><p class="onboarding__info">수능 모의고사 기출 문제지 만들기 어떻게 바뀌었을까요?</p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0113.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">대입기출 문제지 만들기</h4><p class="onboarding__info">
                                                        문제지 만들기 첫 단계에서 학습종류 선택을 통해 대입기출 문제지를 제작할
                                                        수 있게 되었어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0114.png"
                                                             alt="" /></div></article></section><section id="seciton1-08"><article><h4 class="onboarding__title">학습 분석표 바로가기</h4><p class="onboarding__info">학습 분석표 바로가기 버튼은 어떻게 바뀌었을까요?</p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0115.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">학습 분석 보고서</h4><p class="onboarding__info">
                                                        - 홈화면(대시보드)의 ‘미발송 학습 분석 보고서’ 를 선택하면 ‘학습
                                                        분석 보고서’ 화면으로 빠른 이동이 가능해요. <br>
                                                        - 화면 좌측의 채점&클리닉의 ‘학습 분석 보고서’ 메뉴를 클릭 후 ‘학습 분석 보고서’ 화면으로 이동해요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0116.png"
                                                             alt="" /></div></article></section><section id="seciton1-09"><article><h4 class="onboarding__title">문제지 목록 | 수업 바로가기</h4><p class="onboarding__info">문제지 목록 | 수업 바로가기 버튼은 어떻게 변했을까요?</p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0117.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">문제지 보관함 바로가기</h4><p class="onboarding__info">
                                                        - 홈화면(대시보드)의 ‘배정 후 미채점’ 버튼을 선택하면 ‘내 문제지’
                                                        화면으로 빠른 이동이 가능해요. <br>
                                                        - 화면 우측의 문제지 보관함 버튼을 클릭하여도 ‘내 문제지’ 화면으로 이동합니다.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s01_0118.png"
                                                             alt="" /></div></article></section></div></div></div></div></div></div><div class="tab-pane fade" id="tab-pane-onboarding-2" role="tabpanel" tabindex="0"><div class="onboarding" style="right: 0px; max-height: 650px; overflow-x: hidden; overflow-y: auto; margin-bottom: 0"><div class="m-container"><div class="onboarding__wrap"><div class="onboarding__left"><ul><li><a href="#seciton2-01" class="scroll active">현황·준비</a><li><a href="#seciton2-02" class="scroll">수업>미배정 문제지</a><li><a href="#seciton2-03" class="scroll">문제지 보관함>내 문제지</a><li><a href="#seciton2-04" class="scroll">채점학생 선택</a><li><a href="#seciton2-05" class="scroll">교재선택</a><li><a href="#seciton2-07" class="scroll">수업>학생별 교재</a><li><a href="#seciton2-08" class="scroll">교재 채점</a><li><a href="#seciton2-09" class="scroll">교재 채점(학생별)</a><li><a href="#seciton2-10" class="scroll">교재매칭채점(반별)</a><li><a href="#seciton2-11" class="scroll">KMT(전국학력평가)</a></ul></div><div class="onboarding__body"><div class="onboarding__headline"><h3 class="onboarding__stitle">기존 메타수학</h3><h3 class="onboarding__stitle">신규 메타수학</h3></div><div class="onboarding__content"><section id="seciton2-01"><article><h4 class="onboarding__title">현황·준비</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0101.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">반별 현황 / 학생별 종합 현황</h4><p class="onboarding__info">
                                                        홈 화면(대시보드)에서 등록 반 현황과 학생 종합현황으로 한눈에 파악하기
                                                        쉽도록 바뀌었어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0102.png"
                                                             alt="" /></div></article></section><section id="seciton2-02"><article><h4 class="onboarding__title">수업>미배정 문제지</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0201.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">문제지 보관함>내 문제지</h4><p class="onboarding__info">
                                                        문제지 만들기의 ‘내 문제지’ 탭으로 들어오면 미배정 문제지 리스트를 볼
                                                        수 있어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0202.png"
                                                             alt="" /></div></article></section><section id="seciton2-03"><article><h4 class="onboarding__title">수업>배정 문제지</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><h5 class="onboarding__title3 mt-24">학생별 문제지</h5><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0301.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">채점&클리닉</h4><p class="onboarding__info">
                                                        채점&클리닉 메뉴의 ‘학생별 채점’과 ‘반별 채점’에서 배정된 문제지를
                                                        확인 후 바로 채점할 수 있어요.
                                                    </p><h5 class="onboarding__title3 mt-24">학생별 문제지</h5><div class="onboarding__img d-flex align-items-center gap-3"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0302.png"
                                                             alt="" /><p class="onboarding__info"><strong class="text-primary">학생별 채점</strong>으로 분류된 문제지는 문제지를
                                                            제작할 때 <br><strong class="text-primary">
                                                                ‘학생별’ 선택으로 만든 문제지가
                                                                배정
                                                            </strong>돼요. <br>
                                                            '반'으로 묶어 공부하지 않고 학생 개별로 공부하는 <br>
                                                            학원 또는 공부방, 교습소 원장님이 사용하시면 편리해요.
                                                        </p></div><div class="onboarding__img d-flex align-items-center gap-3 mt-40 mb-40" "><img class="" src=" /assets/common/onboarding/images/img_onboarding_s02_0303.png" alt="" /></div></article></section><section><article><h5 class="onboarding__title3">반별 문제지</h5><div class="onboarding__img d-flex align-items-center gap-3"><img class=""
                                                             src=" /assets/common/onboarding/images/img_onboarding_s02_0304.png"
                                                             alt="" /></div></article><article><h5 class="onboarding__title3">반별 문제지</h5><div class="onboarding__img d-flex align-items-center gap-3"><img class=""
                                                             src=" /assets/common/onboarding/images/img_onboarding_s02_0305.png"
                                                             alt="" /><p class="onboarding__info"><strong class="text-primary">반별 채점</strong>으로 분류된 문제지는 <br>
                                                            문제지를 제작할 때<strong class="text-primary">
                                                                ‘반별’ 선택으로 만든 문제지가
                                                                배정
                                                            </strong>돼요. <br>
                                                            '반'단위 그룹으로 묶어 동시에 채점 관리하는 선생님이 <br>
                                                            사용하시면 편리해요.
                                                        </p></div><div class="onboarding__img d-flex align-items-center gap-3"><img class=""
                                                             src=" /assets/common/onboarding/images/img_onboarding_s02_0306.png"
                                                             alt="" /></div></article></section><section id="seciton2-04"><article><h4 class="onboarding__title">채점 학생 선택</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0401.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">채점 학생 선택</h4><p class="onboarding__info">채점 시 학생 선택 드로우 바가 오른쪽으로 위치가 변경되었어요.</p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0402.png"
                                                             alt="" /></div></article></section><section id="seciton2-05"><article><h4 class="onboarding__title">교재선택</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 52px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0501.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">사용교재</h4><p class="onboarding__info">
                                                        관리>사용교재에서 검색 필터와 학년 선택 옵션을 통해 학생별 사용 교재를 찾기
                                                        더 쉬워졌어요. <br>
                                                        '관리' 메뉴에서 신규 학생 등록, 반 등록, 교재 등록까지 이어서 입력하시면 편리해요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0502.png"
                                                             alt="" /></div><h4 class="onboarding__title mt-40">학생별 종합 현황</h4><p class="onboarding__info">
                                                        홈화면(대시보드)>학생별 종합 현황에서 <strong class="text-primary">학생별 교재(개별)</strong>를 선택할 수 있어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0503.png"
                                                             alt="" /></div></article></section><section id="seciton2-06"><article><h4 class="onboarding__title">현황·준비>반별 교재</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 52px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0601.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">공통 교재</h4><p class="onboarding__info">
                                                        홈화면(대시보드)>반별학습현황> 반관리에서 반에서 사용하는 공통교재(반공통)를
                                                        선택할 수 있어요. <br>
                                                        반 공통교재로 등록된 교재는 추후 신규학생이 반에 등록되었을때 자동으로 신규학생에게 배정되어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0602.png"
                                                             alt="" /></div><p class="onboarding__info"><strong class="text-primary">'반관리'</strong>를
                                                        선택 후 사용교재에서 <strong class="text-primary">'공통 교재 선택'</strong>을 클릭하세요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0603.png"
                                                             alt="" /></div></article></section><section id="seciton2-07"><article><h4 class="onboarding__title">수업>학생별 교재</h4><p class="onboarding__info">학생별 교재 선택 어떻게 바뀌었을까요?</p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0701.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">반별 현황>개별 교재</h4><p class="onboarding__info">
                                                        홈화면(대시보드)>반별학습현황> 학생관리에서 반에서 사용하는 학생별
                                                        교재(반개별)를 선택할 수 있어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0702.png"
                                                             alt="" /></div><p class="onboarding__info"><strong class="text-primary">'학생관리'</strong>
                                                        선택 후 사용교재에서 <strong class="text-primary">'개별 교재 선택'</strong>을 클릭하세요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0703.png"
                                                             alt="" /></div></article></section><section id="seciton2-08"><article><h4 class="onboarding__title">교재 채점</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0801.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">교재매칭 채점</h4><p class="onboarding__info">
                                                        채점&클리닉의 교재매칭채점에서 <strong class="text-primary">교재매칭</strong>을 진행할 수 있어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0802.png"
                                                             alt="" /></div></article></section><section id="seciton2-09"><article><h4 class="onboarding__title">교재채점(학생별)</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0901.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">교재매칭채점(학생별)</h4><p class="onboarding__info">
                                                        홈화면(대시보드)>학생별 종합 현황에서 <strong class="text-primary">교재매칭 채점/오답 문제지 만들기</strong>를 통해 <br><strong class="text-primary">학생 개별 교재매칭을 진행</strong>할 수 있어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_0902.png"
                                                             alt="" /></div></article></section><section id="seciton2-10"><article><h4 class="onboarding__title">교재 채점(반별)</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_1001.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">교재매칭 채점 (반별)</h4><p class="onboarding__info">
                                                        홈화면(대시보드)>반별 현황에서 <strong class="text-primary">교재매칭 채점/오답 문제지 만들기</strong>를 통해
                                                        <strong class="text-primary">반별 교재매칭</strong>을 진행할 수 있어요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_1002.png"
                                                             alt="" /><p class="onboarding__info">
                                                            '반관리' 선택 후 '사용 교재'에서 '교재매칭 채점 / 오답 문제지
                                                            만들기' 버튼을 클릭해 주세요.
                                                        </p></div><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_1003.png"
                                                             alt="" /></div></article></section><section id="seciton2-11"><article><h4 class="onboarding__title">KMT(전국학력평가)</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_1101.png"
                                                             alt="" /></div></article><article><h4 class="onboarding__title">KMT(전국학력평가)</h4><p class="onboarding__info">
                                                        KMT(전국학력평가) 메뉴는 프리미엄 기능의 하위 메뉴에 위치하며 기존 기능과
                                                        동일해요.
                                                    </p><div class="onboarding__img"><img class=""
                                                             src="/assets/common/onboarding/images/img_onboarding_s02_1102.png"
                                                             alt="" /></div></article></section></div></div></div></div></div></div></div><div class="tab-pane fade" id="tab-pane-onboarding-3" role="tabpanel" tabindex="0"><div class="onboarding" style="right: 0px; max-height: 650px; overflow-y: auto; margin-bottom: 0"><div class="m-container"><div class="onboarding__wrap"><div class="onboarding__left"><ul><li><a href="#seciton3-01" class="scroll active">교실관리/운영관리</a><li><a href="#seciton3-02" class="scroll">학생관리</a><li><a href="#seciton3-03" class="scroll">교사관리</a><li><a href="#seciton3-04" class="scroll">반 관리</a><li><a href="#seciton3-05" class="scroll">홍보/문자 관리</a><li><a href="#seciton3-06" class="scroll">자료실</a><li><a href="#seciton3-07" class="scroll">자료실>표지 자료실</a><li><a href="#seciton3-08" class="scroll">학습분석표>출석 관리</a><li><a href="#seciton3-09" class="scroll">운영관리>정산관리</a></ul></div><div class="onboarding__body"><div class="onboarding__headline"><h3 class="onboarding__stitle">기존 메타수학</h3><h3 class="onboarding__stitle">신규 메타수학</h3></div><div class="onboarding__content"><section id="seciton3-01"><article><h4 class="onboarding__title">교실관리/운영관리</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0101.png"
                                                         alt="" /></div></article><article><h4 class="onboarding__title">관리</h4><p class="onboarding__info">
                                                    교실관리와 운영관리의 메뉴들이 <strong class="text-primary">관리 메뉴에 하나로 통합</strong>되었어요
                                                </p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0102.png"
                                                         alt="" /></div></article></section><section id="seciton3-02"><article><h4 class="onboarding__title">학생관리</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0201.png"
                                                         alt="" /></div></article><article><h4 class="onboarding__title">학생등록</h4><p class="onboarding__info">
                                                    관리메뉴의 학생등록에서 기존과 동일하게 학생 대량 등록과 개별 등록이 가능해요.
                                                </p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0202.png"
                                                         alt="" /></div></article></section><section id="seciton3-03"><article><h4 class="onboarding__title">교사관리</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0301.png"
                                                         alt="" /></div></article><article><h4 class="onboarding__title">교사등록</h4><p class="onboarding__info">
                                                    관리메뉴의 교사등록에서 교사등록은 물론 일괄 사용권한 변경을 할 수 있도록
                                                    바뀌었어요.
                                                </p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0302.png"
                                                         alt="" /></div></article></section><section id="seciton3-04"><article><h4 class="onboarding__title">반 관리</h4><p class="onboarding__info">기존의 메타수학 반 관리 어떻게 바뀌었을까요?</p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0401.png"
                                                         alt="" /></div></article><article><h4 class="onboarding__title">반 편성</h4><p class="onboarding__info">
                                                    관리메뉴의 ‘반 편성’에서 반 별 정보 표시는 물론, 반 학생 보기 및 반별
                                                    상세수정이 가능하도록 바뀌었어요.
                                                </p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0402.png"
                                                         alt="" /></div><div class="onboarding__img d-flex align-items-center gap-3 mt-40 mb-40"><img class="img-origin"
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0403.png"
                                                         alt="" /><p class="onboarding__info">‘상세’ 버튼을 누르면 반 정보를 수정할 수 있어요</p></div><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0404.png"
                                                         alt="" /><p class="onboarding__info d-flex justify-content-end">
                                                        ‘반 학생’ 버튼을
                                                        누르면 반에 소속된 학생 정보를 수정할 수 있어요
                                                    </p></div></article></section><section id="seciton3-05"><article><h4 class="onboarding__title">홍보/문자 관리</h4><p class="onboarding__info"></p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0501.png"
                                                         alt="" /></div></article><article><h4 class="onboarding__title">홍보/문자</h4><p class="onboarding__info">
                                                    홍보/문자관리에서 기존 기능 그대로 문자 발송 및 재전송이 가능해요 추가로 유료 문자 신청도 가능해졌어요. <br>
                                                    유료문자를 사용하면 전송 실패할 확률이 없어지고 예약발송 등의 편의기능을 사용할 수 있어요.
                                                </p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0502.png"
                                                         alt="" /></div></article></section><section id="seciton3-06"><article><h4 class="onboarding__title">자료실</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0601.png"
                                                         alt="" /></div></article><article><h4 class="onboarding__title">고객센터>자료실</h4><p class="onboarding__info">고객센터 메뉴에 기존의 자료실 메뉴가 통합되었어요.</p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0602.png"
                                                         alt="" /></div></article></section><section id="seciton3-07"><article><h4 class="onboarding__title">자료실>표지 자료실</h4><p class="onboarding__info"></p><div class="onboarding__img" style="margin-top: 32px;"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0701.png"
                                                         alt="" /></div></article><article><h4 class="onboarding__title">문제지 만들기>프린트 설정 옵션(표지)</h4><p class="onboarding__info">
                                                    문제지 만들기 과정 중 프린트 설정 단계에서 표지를 고른 후 문제지와 같이 바로
                                                    인쇄할 수 있어요.
                                                </p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0702.png"
                                                         alt="" /></div></article></section><section id="seciton3-08"><article><h4 class="onboarding__title">학습분석표>출석 관리</h4><p class="onboarding__info">학습 분석표와 함께 있던 출석관리 메뉴 어떻게 바뀌었을까요?</p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0801.png"
                                                         alt="" /></div></article><article><h4 class="onboarding__title">관리>출결현황</h4><p class="onboarding__info">기존의 학습 분석표와 같이 있던 출석관리는 관리 메뉴에 통합되었어요.</p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0802.png"
                                                         alt="" /></div></article></section><section id="seciton3-09"><article><h4 class="onboarding__title">운영관리>정산관리</h4><p class="onboarding__info"></p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0901.png"
                                                         alt="" /></div></article><article><h4 class="onboarding__title">마이페이지>정산 관리</h4><p class="onboarding__info">
                                                    정산관리는 상단의 <strong class="text-primary">프로필(교실명)을 클릭 후 </strong>정산관리 메뉴에서 확인할 수
                                                    있어요. <br>
                                                    원장님과 권한을 가진 분만 볼 수 있어야 하기 때문에 특별한 위치로 옮겼어요.
                                                </p><div class="onboarding__img"><img class=""
                                                         src="/assets/common/onboarding/images/img_onboarding_s03_0902.png"
                                                         alt="" /></div></article></section></div></div></div></div></div></div></div></div></div></div>`;
