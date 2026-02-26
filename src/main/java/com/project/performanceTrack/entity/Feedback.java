package com.project.performanceTrack.entity;

import com.project.performanceTrack.enums.FeedbackType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

// Feedback entity - stores feedback on goals/reviews
@Entity
@Table(name = "feedback")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Feedback {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "feedback_id")
    private Integer feedbackId;

    @ManyToOne
    @JoinColumn(name = "review_id")
    private PerformanceReview review;

    @ManyToOne
    @JoinColumn(name = "goal_id")
    private Goal goal;

    @ManyToOne
    @JoinColumn(name = "given_by_user_id")
    private User givenByUser;

    @Column(columnDefinition = "TEXT")
    private String comments;

    @Column(name = "feedback_type", length = 50)
    @Enumerated(EnumType.STRING)
    private FeedbackType feedbackType;

    @Column(nullable = false)
    private LocalDateTime date;
}
