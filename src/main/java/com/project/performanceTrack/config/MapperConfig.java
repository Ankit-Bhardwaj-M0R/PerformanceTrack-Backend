package com.project.performanceTrack.config;

import com.project.performanceTrack.dto.FeedbackRequest;
import com.project.performanceTrack.dto.FeedbackResponseDTO;
import com.project.performanceTrack.dto.NotificationResponseDTO;
import com.project.performanceTrack.dto.ReportResponseDTO;
import com.project.performanceTrack.entity.Feedback;
import com.project.performanceTrack.entity.Notification;
import com.project.performanceTrack.entity.Report;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();

        // 1. SET MATCHING STRATEGY TO STRICT
        // This stops ModelMapper from guessing. It will only map if names match exactly.
        mapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT);

        // 2. Map Request to Entity (Skip the ID)
        mapper.typeMap(FeedbackRequest.class, Feedback.class).addMappings(m -> {
            m.skip(Feedback::setFeedbackId);
        });

        // 3. Map Entity to ResponseDTO (Flattening)
        mapper.typeMap(Feedback.class, FeedbackResponseDTO.class).addMappings(m -> {
            // Use 'src' to avoid null pointer issues during configuration
            m.map(src -> src.getGivenByUser().getName(), FeedbackResponseDTO::setGiverName);
            m.map(src -> src.getGivenByUser().getUserId(), FeedbackResponseDTO::setGiverId);
            m.map(src -> src.getGoal().getTitle(), FeedbackResponseDTO::setGoalTitle);
            m.map(src -> src.getGoal().getGoalId(), FeedbackResponseDTO::setGoalId);
        });
        // 4. Map entity of notificationResponseDTO
        mapper.typeMap(Notification.class, NotificationResponseDTO.class).addMappings(m -> {
            m.map(src -> src.getUser().getUserId(), NotificationResponseDTO::setUserId);
        });
        // 5. Map entity of ReportResponseDTO
        mapper.typeMap(Report.class, ReportResponseDTO.class).addMappings(m -> {
            m.map(src -> src.getGeneratedBy().getUserId(), ReportResponseDTO::setGeneratedById);
            m.map(src -> src.getGeneratedBy().getName(), ReportResponseDTO::setGeneratedByName);
        });

        return mapper;
    }
}