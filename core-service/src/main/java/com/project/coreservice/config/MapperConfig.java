package com.project.coreservice.config;

import com.project.coreservice.dto.FeedbackRequest;
import com.project.coreservice.dto.FeedbackResponseDTO;
import com.project.coreservice.entity.Feedback;
import org.modelmapper.ModelMapper;
import org.modelmapper.convention.MatchingStrategies;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class MapperConfig {

    @Bean
    public ModelMapper modelMapper() {
        ModelMapper mapper = new ModelMapper();

        // SET MATCHING STRATEGY TO STRICT
        mapper.getConfiguration()
                .setMatchingStrategy(MatchingStrategies.STRICT);

        // Map Request to Entity (Skip the ID)
        mapper.typeMap(FeedbackRequest.class, Feedback.class).addMappings(m -> {
            m.skip(Feedback::setFeedbackId);
        });

        // Map Entity to ResponseDTO
        mapper.typeMap(Feedback.class, FeedbackResponseDTO.class).addMappings(m -> {
            // Map givenByUserId to giverId
            m.map(Feedback::getGivenByUserId, FeedbackResponseDTO::setGiverId);

            // Map goal fields if goal is present
            m.map(src -> src.getGoal() != null ? src.getGoal().getTitle() : null,
                    FeedbackResponseDTO::setGoalTitle);
            m.map(src -> src.getGoal() != null ? src.getGoal().getGoalId() : null,
                    FeedbackResponseDTO::setGoalId);
        });

        return mapper;
    }
}
