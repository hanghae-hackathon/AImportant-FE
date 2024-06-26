"use client";
import React, { useEffect, useState } from "react";
import ViewQuestionPage from "../view/ViewQuestionPage";
import { useParams, useRouter } from "next/navigation";
import { useRecoilState } from "recoil";
import { storedQuestionAtom } from "@/recoil/stored-question-atom";
import { goToNextQuiz } from "@/utils/goToNextQuiz";
import { StoredQuestion } from "@/type/StoredQuestion";
import { useUpdateStoredQuestions } from "@/hook/useUpdateStoredQuestion";

export default function QuestionPageComponent() {
  const updateStoredQuestions = useUpdateStoredQuestions();
  const router = useRouter();
  const params: { type: string } = useParams();
  // const atom = useRecoilValue(questionAtom);
  const [storedQuestion, setStoredQuestion] =
    useRecoilState(storedQuestionAtom);
  const [loading, setLoading] = useState<boolean>(false);
  const [isSelected, setIsSelected] = useState<boolean>(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number>(6);
  const [selectedContent, setSelectedContent] = useState<string>("");
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [question, setQuestion] = useState<StoredQuestion | null>(null);
  const [stayTime, setStayTime] = useState(3);

  const setQuestionAnswer = (index: number) => {
    const newQuestion: StoredQuestion = {
      ...question,
      selectedAnswer: index,
    } as StoredQuestion;
    setQuestion(newQuestion);
  };

  const selectrAnswer = (content: string, index: number) => {
    setIsSelected(true);
    setSelectedAnswer((_) => index);
  };

  const handleSelectAnswer = () => {
    if (selectedAnswer + 1! === question?.answer) {
      updateStoredQuestions({
        ...question,
        selectedAnswer: selectedAnswer,
        spentTimeSec:
          question.spentTimeSec !== undefined
            ? question.spentTimeSec + stayTime
            : stayTime,
        isCorrected: true,
      });
    } else if (question !== null) {
      updateStoredQuestions({
        ...question,
        selectedAnswer: selectedAnswer,
        spentTimeSec:
          question.spentTimeSec !== undefined
            ? question.spentTimeSec + stayTime
            : stayTime,
        isCorrected: false,
      });
    }
  };

  const modalClose = () => {
    // closeModal();
    // resetChoice();
  };

  // const resetChoice = () => {
  //   setIsSelected(false);
  //   setSelectedAnswer(6);
  //   setIsCorrect(null);
  // };

  // 문제 세팅
  useEffect(() => {
    setLoading(true);

    setIsSelected(false);
    if (question === null) {
      setQuestion(storedQuestion[parseInt(params?.type ?? "2") - 1]);
      setSelectedAnswer(
        storedQuestion[parseInt(params?.type ?? "2") - 1].selectedAnswer ?? 6
      );
    }

    setTimeout(() => {
      setLoading(false);
    }, 500);
  }, []);

  //답이 바뀔때마다 하는 동작
  useEffect(() => {
    if (selectedAnswer !== 6) {
      console.log("isSelected Changed" + selectedAnswer);
      setIsSelected(true);
      setLoading(true);
      setQuestionAnswer(selectedAnswer);
      handleSelectAnswer();
      setTimeout(() => {
        setLoading(false);
        if (isSelected) {
          goToNextQuiz(params, router);
        }
      }, 330);
    }
  }, [selectedAnswer]);

  // 문제풀이시간 세팅
  useEffect(() => {
    const intervalId = setInterval(() => {
      setStayTime((prevTime) => prevTime + 1);
      console.log(stayTime + " staytime");
    }, 1000);

    return () => {
      clearInterval(intervalId);
      console.log(`Stay time: ${stayTime} seconds and cleared`);
    };
  }, [stayTime, isSelected]);

  // 뒤로가기 버튼 동작
  useEffect(() => {
    const handlePopState = (event: PopStateEvent) => {
      // 사용자가 뒤로가기를 누르면 원하는 경로로 리다이렉트
      router.back();
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [router]);

  return (
    <ViewQuestionPage
      isLoading={loading}
      isSelected={isSelected}
      selectedAnswer={selectedAnswer}
      selectedContent={selectedContent}
      isCorrect={isCorrect}
      question={question}
      choiceAnswer={selectrAnswer}
      recommendedQuestions={[]} //! 임시, 사용하지 않음
      isModalOpen={false} //! 임시, 사용하지 않음
      handleYes={handleSelectAnswer}
      closeModal={modalClose} //! 임시, 사용하지 않음
      // resetChoice={resetChoice}
    />
  );
}
